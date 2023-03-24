package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import io.zeebe.zeeqs.data.repository.DecisionEvaluationRepository
import org.camunda.community.zeebe.play.services.ZeebeClockService
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*
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
    private val decisionEvaluationRepository: DecisionEvaluationRepository
) {

    private val executor = Executors.newSingleThreadExecutor()

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

}