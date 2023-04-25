package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.client.api.response.DeploymentEvent
import io.zeebe.zeeqs.data.entity.DecisionRequirements
import io.zeebe.zeeqs.data.entity.Process
import io.zeebe.zeeqs.data.repository.DecisionRequirementsRepository
import io.zeebe.zeeqs.data.repository.ProcessRepository
import org.camunda.community.zeebe.play.services.ZeebeClockService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.time.Duration
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit

private val RETRY_INTERVAL = Duration.ofMillis(100)

@RestController
@RequestMapping("/rest/deployments")
class DeploymentsResource(
    private val zeebeClient: ZeebeClient,
    private val zeebeClockService: ZeebeClockService,
    private val processRepository: ProcessRepository,
    private val decisionRequirementsRepository: DecisionRequirementsRepository
) {

    private val executor = Executors.newSingleThreadExecutor()

    @RequestMapping(path = ["/"], method = [RequestMethod.POST])
    fun deployResources(@RequestParam("resources") resources: Array<MultipartFile>): Long {
        // keep this API for backward compatibility with Web Modeler
        return deploy(resources).key;
    }

    @RequestMapping(path = ["/deploy"], method = [RequestMethod.POST])
    fun deployResourcesWithMetadata(@RequestParam("resources") resources: Array<MultipartFile>): DeploymentResponse {
        // Use the current time for the duplicate check. The isDuplicate property is not available.
        val timeBeforeDeploy = zeebeClockService.getCurrentTime()
        val deployment = deploy(resources)

        // Wait until the resources are imported
        val deployedProcesses = deployment.processes.associate {
            it.processDefinitionKey to findProcessByKeyAsync(it.processDefinitionKey)
        }
        val deployedDecisionRequirements = deployment.decisions.associate {
            it.decisionRequirementsKey to findDecisionRequirementsByKeyAsync(it.decisionRequirementsKey)
        }

        return DeploymentResponse(
            deploymentKey = deployment.key,
            deployedProcesses = deployment.processes.map { process ->
                DeployedProcess(
                    processKey = process.processDefinitionKey,
                    bpmnProcessId = process.bpmnProcessId,
                    resourceName = process.resourceName,
                    isDuplicate = deployedProcesses[process.processDefinitionKey]
                        ?.let {
                            it.get(
                                10,
                                TimeUnit.SECONDS
                            ).deployTime < timeBeforeDeploy.toEpochMilli()
                        }
                        ?: false
                )
            },
            deployedDecisions = deployment.decisions.map { decision ->
                val decisionRequirements =
                    deployedDecisionRequirements[decision.decisionRequirementsKey]?.get(
                        10,
                        TimeUnit.SECONDS
                    )

                DeployedDecision(
                    decisionKey = decision.decisionKey,
                    decisionId = decision.dmnDecisionId,
                    resourceName = decisionRequirements?.resourceName ?: "?",
                    isDuplicate = decisionRequirements
                        ?.let { it.deployTime < timeBeforeDeploy.toEpochMilli() }
                        ?: false
                )
            }
        )
    }

    private fun deploy(resources: Array<MultipartFile>): DeploymentEvent {
        if (resources.isEmpty()) {
            throw RuntimeException("no resources to deploy")
        }

        val firstResource = resources.first()

        val deployCommand = zeebeClient.newDeployResourceCommand()
            .addResourceBytes(firstResource.bytes, firstResource.resource.filename)

        resources
            .drop(1)
            .forEach {
                deployCommand.addResourceBytes(it.bytes, it.resource.filename)
            }

        return deployCommand
            .send()
            .join()
    }

    private fun findProcessByKeyAsync(processKey: Long): Future<Process> =
        executor.submit(Callable {
            findProcessByKey(processKey = processKey)
        })

    private fun findProcessByKey(processKey: Long): Process {
        return processRepository
            .findByIdOrNull(processKey)
            ?: run {
                // wait and retry
                Thread.sleep(RETRY_INTERVAL.toMillis())
                findProcessByKey(processKey)
            }
    }

    private fun findDecisionRequirementsByKeyAsync(decisionRequirementsKey: Long): Future<DecisionRequirements> =
        executor.submit(Callable {
            findDecisionRequirementsByKey(decisionRequirementsKey = decisionRequirementsKey)
        })

    private fun findDecisionRequirementsByKey(decisionRequirementsKey: Long): DecisionRequirements {
        return decisionRequirementsRepository
            .findByIdOrNull(decisionRequirementsKey)
            ?: run {
                // wait and retry
                Thread.sleep(RETRY_INTERVAL.toMillis())
                findDecisionRequirementsByKey(decisionRequirementsKey)
            }
    }

    data class DeploymentResponse(
        val deploymentKey: Long,
        val deployedProcesses: List<DeployedProcess>,
        val deployedDecisions: List<DeployedDecision>
    )

    data class DeployedProcess(
        val processKey: Long,
        val bpmnProcessId: String,
        val resourceName: String,
        val isDuplicate: Boolean
    )

    data class DeployedDecision(
        val decisionKey: Long,
        val decisionId: String,
        val resourceName: String,
        val isDuplicate: Boolean
    )

}