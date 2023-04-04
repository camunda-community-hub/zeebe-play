package org.camunda.community.zeebe.play.rest

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import io.camunda.connector.impl.outbound.OutboundConnectorConfiguration
import io.camunda.connector.runtime.util.ConnectorHelper
import io.camunda.connector.runtime.util.outbound.ConnectorJobHandler
import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.client.api.response.ActivatedJob
import io.camunda.zeebe.model.bpmn.Bpmn
import io.camunda.zeebe.model.bpmn.instance.FlowElement
import io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeTaskHeaders
import io.zeebe.zeeqs.data.entity.ElementInstance
import io.zeebe.zeeqs.data.entity.Job
import io.zeebe.zeeqs.data.entity.JobState
import io.zeebe.zeeqs.data.entity.Process
import io.zeebe.zeeqs.data.repository.ElementInstanceRepository
import io.zeebe.zeeqs.data.repository.JobRepository
import io.zeebe.zeeqs.data.repository.ProcessRepository
import io.zeebe.zeeqs.data.service.VariableService
import org.camunda.community.zeebe.play.connectors.ConnectorService
import org.camunda.community.zeebe.play.connectors.ConnectorsSecretProvider
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

@RestController
@RequestMapping("/rest/connectors")
class ConnectorsResource(
    private val connectorService: ConnectorService,
    private val connectorsSecretProvider: ConnectorsSecretProvider,
    private val zeebeClient: ZeebeClient,
    private val jobRepository: JobRepository,
    private val processRepository: ProcessRepository,
    private val elementInstanceRepository: ElementInstanceRepository,
    private val variableService: VariableService
) {

    companion object {
        private val objectMapper = ObjectMapper()
    }

    @RequestMapping(method = [RequestMethod.GET])
    fun getAvailableConnectors(): ConnectorsDto {
        return ConnectorsDto(
            connectors = connectorService
                .findAvailableConnectors()
                .map { ConnectDto(name = it.name, type = it.type) }
        )
    }

    @RequestMapping(path = ["/{jobType}/execute/{jobKey}"], method = [RequestMethod.POST])
    fun executeJob(@PathVariable("jobType") jobType: String, @PathVariable("jobKey") jobKey: Long) {
        val connectorConfig = (connectorService.findAvailableConnectors()
            .find { it.type == jobType }
            ?: throw RuntimeException("No connector found with job type '$jobType'."))

        val connector = ConnectorHelper.instantiateConnector(connectorConfig.connectorClass)
        val jobHandler = ConnectorJobHandler(connector, connectorsSecretProvider)

        // a job may be invoked more than once
        jobRepository.findByIdOrNull(jobKey)
            ?.takeIf { it.state == JobState.ACTIVATABLE }
            ?.let { job ->
                FakeActivatedJob(
                    job = job,
                    process = processRepository.findByIdOrNull(job.processDefinitionKey),
                    elementInstance = elementInstanceRepository.findByIdOrNull(job.elementInstanceKey),
                    variables = getJobVariables(job, connectorConfig)
                )
            }
            ?.let { jobHandler.handle(zeebeClient, it) }
            ?: throw RuntimeException("No job found with key '$jobKey'.")
    }

    private fun getJobVariables(
        job: Job,
        connectorConfig: OutboundConnectorConfiguration
    ): String {
        val allVariables = variableService.getVariables(
            elementInstanceKey = job.elementInstanceKey,
            localOnly = false,
            shadowing = true
        )
        val filteredVariables =
            allVariables.filter { connectorConfig.inputVariables.contains(it.name) }

        return filteredVariables.joinToString(
            separator = ",",
            prefix = "{",
            postfix = "}"
        ) { "\"${it.name}\": ${it.value}" }
    }

    private fun findConnectorJob(
        connectorConfig: OutboundConnectorConfiguration,
        jobKey: Long,
        attempt: Int = 1
    ): ActivatedJob? {
        // doesn't work well for multi-instance (i.e. more than one active job)
        // blocked by https://github.com/camunda/zeebe/issues/5073
        val job = zeebeClient
            .newActivateJobsCommand()
            .jobType(connectorConfig.type)
            .maxJobsToActivate(attempt * 100)
            .workerName(connectorConfig.name)
            .fetchVariables(connectorConfig.inputVariables.toList())
            .timeout(Duration.ofSeconds(1)) // we don't want to block other jobs too long
            .send()
            .join()
            .jobs
            .find { it.key == jobKey }

        if (job == null && attempt <= 5) {
            // try again
            return findConnectorJob(connectorConfig, jobKey, attempt + 1)
        }

        return job
    }

    data class ConnectorsDto(
        val connectors: List<ConnectDto>
    )

    data class ConnectDto(
        val name: String,
        val type: String
    )

    data class FakeActivatedJob(
        private val job: Job,
        private val process: Process?,
        private val elementInstance: ElementInstance?,
        private val variables: String
    ) : ActivatedJob {
        override fun getKey(): Long {
            return job.key
        }

        override fun getType(): String {
            return job.jobType
        }

        override fun getProcessInstanceKey(): Long {
            return job.processInstanceKey
        }

        override fun getBpmnProcessId(): String {
            return process?.bpmnProcessId ?: "?"
        }

        override fun getProcessDefinitionVersion(): Int {
            return process?.version ?: -1
        }

        override fun getProcessDefinitionKey(): Long {
            return job.processDefinitionKey
        }

        override fun getElementId(): String {
            return elementInstance?.elementId ?: "?"
        }

        override fun getElementInstanceKey(): Long {
            return job.elementInstanceKey
        }

        override fun getCustomHeaders(): Map<String, String> {
            return process?.let {
                val bpmn = Bpmn.readModelFromStream(it.bpmnXML.byteInputStream())
                val element: FlowElement = bpmn.getModelElementById(elementId)

                element
                    .getSingleExtensionElement(ZeebeTaskHeaders::class.java)
                    ?.headers
                    ?.associate { it.key to it.value }
                    ?: emptyMap()
            } ?: emptyMap()
        }

        override fun getWorker(): String {
            return job.worker ?: ""
        }

        override fun getRetries(): Int {
            return job.retries ?: -1
        }

        override fun getDeadline(): Long {
            return -1
        }

        override fun getVariables(): String {
            return variables
        }

        override fun getVariablesAsMap(): Map<String, Any> {
            val typeRef = object : TypeReference<Map<String, Any>>() {}
            return objectMapper.readValue(variables, typeRef)
        }

        override fun <T : Any?> getVariablesAsType(variableType: Class<T>?): T {
            TODO("Not yet implemented")
        }

        override fun toJson(): String {
            return objectMapper.writeValueAsString(this)
        }
    }
}