package org.camunda.community.zeebe.play.rest

import io.camunda.connector.impl.outbound.OutboundConnectorConfiguration
import io.camunda.connector.runtime.util.outbound.ConnectorJobHandler
import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.client.api.response.ActivatedJob
import org.camunda.community.zeebe.play.connectors.ConnectorService
import org.camunda.community.zeebe.play.connectors.ConnectorsSecretProvider
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
    private val zeebeClient: ZeebeClient
) {

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

        val jobHandler = ConnectorJobHandler(connectorConfig.function, connectorsSecretProvider)

        findConnectorJob(connectorConfig, jobKey)
            ?.let { jobHandler.handle(zeebeClient, it) }
            ?: throw RuntimeException("No job found with key '$jobKey'.")
    }

    private fun findConnectorJob(
        connectorConfig: OutboundConnectorConfiguration,
        jobKey: Long,
        attempt: Int = 1
    ): ActivatedJob? {
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
}