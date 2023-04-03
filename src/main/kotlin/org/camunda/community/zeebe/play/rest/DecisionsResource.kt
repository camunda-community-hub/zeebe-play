package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.dmn.DecisionEngineFactory
import io.camunda.zeebe.dmn.impl.ParsedDmnScalaDrg
import io.zeebe.zeeqs.data.repository.DecisionEvaluationRepository
import io.zeebe.zeeqs.data.repository.DecisionRepository
import io.zeebe.zeeqs.data.repository.DecisionRequirementsRepository
import org.camunda.community.zeebe.play.services.ZeebeClockService
import org.camunda.dmn.parser.*
import org.camunda.feel.syntaxtree.Exp
import org.camunda.feel.syntaxtree.PathExpression
import org.camunda.feel.syntaxtree.Ref
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.*
import scala.jdk.javaapi.CollectionConverters
import java.io.ByteArrayInputStream
import java.time.Duration
import java.time.Instant
import java.util.concurrent.Callable
import java.util.concurrent.Executors

private val RETRY_INTERVAL = Duration.ofMillis(100)

@RestController
@RequestMapping("/rest/decisions")
class DecisionsResource(
    private val zeebeClient: ZeebeClient,
    private val zeebeClockService: ZeebeClockService,
    private val decisionEvaluationRepository: DecisionEvaluationRepository,
    private val decisionRepository: DecisionRepository,
    private val decisionRequirementsRepository: DecisionRequirementsRepository
) {
    private val executor = Executors.newSingleThreadExecutor()

    private val decisionEngine = DecisionEngineFactory.createDecisionEngine()

    @RequestMapping(path = ["/{decisionKey}"], method = [RequestMethod.POST])
    fun evaluateDecision(
        @PathVariable("decisionKey") decisionKey: Long,
        @RequestBody variables: String
    ): Long {

        val now = zeebeClockService.getCurrentTime()

        // the response doesn't contain the key
        zeebeClient.newEvaluateDecisionCommand()
            .decisionKey(decisionKey)
            .variables(variables)
            .send()
            .join()

        return executor.submit(Callable {
            getDecisionEvaluationKey(
                decisionKey = decisionKey,
                commandTime = now
            )
        }).get()
    }

    private fun getDecisionEvaluationKey(decisionKey: Long, commandTime: Instant): Long {
        var decisionEvaluationKey = -1L
        while (decisionEvaluationKey < 0) {
            decisionEvaluationKey = decisionEvaluationRepository.findAllByDecisionKey(
                decisionKey,
                PageRequest.of(0, 100)
            )
                .firstOrNull { it.evaluationTime >= commandTime.toEpochMilli() }
                ?.key
                ?: run {
                    Thread.sleep(RETRY_INTERVAL.toMillis())
                    -1L
                }
        }
        return decisionEvaluationKey
    }

    @RequestMapping(path = ["/{decisionKey}/inputs"], method = [RequestMethod.GET])
    fun getDecisionInputs(@PathVariable("decisionKey") decisionKey: Long): DecisionInputsDto {
        val decision = decisionRepository.findByIdOrNull(decisionKey)
            ?: throw RuntimeException("No decision found for key '$decisionKey'.")

        val decisionRequirements =
            (decisionRequirementsRepository.findByIdOrNull(decision.decisionRequirementsKey)
                ?: throw RuntimeException("No decision requirements found for decision with key '$decisionKey'."))

        val dmnStream = ByteArrayInputStream(decisionRequirements.dmnXML.toByteArray())
        val parseDrg = decisionEngine.parse(dmnStream)
        val variableNames = when (parseDrg) {
            is ParsedDmnScalaDrg -> parseDrg.parsedDmn.decisionsById().get(decision.decisionId)
                .map { getInputsOfDecision(decision = it).toSet() }
                .getOrElse { emptySet<String>() }

            else -> emptySet()
        }

        val decisionIds = parseDrg.decisions.map { it.id }
        val inputVariableNames = variableNames.filterNot { decisionIds.contains(it) }

        return DecisionInputsDto(
            inputs = inputVariableNames.map { DecisionInputDto(name = it) }
        )
    }

    private fun getInputsOfDecision(decision: ParsedDecision): Set<String> {
        val requiredDecision = CollectionConverters.asJava(decision.requiredDecisions())

        return getInputsOfDecisionLogic(decision.logic()) +
                requiredDecision.flatMap { getInputsOfDecision(it) }
    }

    private fun getInputsOfDecisionLogic(decisionLogic: ParsedDecisionLogic?): Set<String> {
        return when (decisionLogic) {
            is ParsedDecisionTable -> CollectionConverters.asJava(decisionLogic.inputs())
                .flatMap { getVariable(it) }
                .toSet()

            else -> emptySet()
        }
    }

    private fun getVariable(input: ParsedInput): List<String> {
        return when (val inputExp = input.expression()) {
            is FeelExpression -> getVariable(inputExp.expression().expression())
            else -> emptyList()
        }
    }

    private fun getVariable(exp: Exp): List<String> {
        return when (exp) {
            is Ref -> listOf(exp.names().head())
            is PathExpression -> getVariable(exp.path())
            else -> emptyList()
        }
    }

    data class DecisionInputsDto(val inputs: List<DecisionInputDto>)

    data class DecisionInputDto(val name: String)

}