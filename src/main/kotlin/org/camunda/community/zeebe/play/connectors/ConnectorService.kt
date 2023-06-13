package org.camunda.community.zeebe.play.connectors

import io.camunda.connector.impl.outbound.OutboundConnectorConfiguration
import io.camunda.connector.runtime.core.discovery.SPIConnectorDiscovery
import io.camunda.zeebe.model.bpmn.Bpmn
import io.camunda.zeebe.model.bpmn.BpmnModelInstance
import io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeInput
import io.zeebe.zeeqs.data.repository.ProcessRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Controller

@Controller
class ConnectorService(
    private val processRepository: ProcessRepository,
    private val connectorSecretRepository: ConnectorSecretRepository
) {

    // Connector secrets can be references in a string or in placeholder syntax
    // 1) { x: "secrets.MY_API_KEY"}
    // 2) "https://" + baseUrl + "/{{secrets.MY_API_KEY}}"
    private val secretRegex = Regex(pattern = "[\"|{]?secrets\\.((\\w|-)+)[\"|}]?")

    fun getMissingConnectorSecrets(processDefinitionKey: Long): List<String> {
        val referencedSecrets =
            getReferencedConnectorSecrets(processDefinitionKey = processDefinitionKey)

        val existingSecrets = connectorSecretRepository.findAll().map { it.name }

        return referencedSecrets.filterNot { existingSecrets.contains(it) }
    }

    @Cacheable(cacheNames = ["processConnectorSecrets"])
    fun getReferencedConnectorSecrets(processDefinitionKey: Long): List<String> {
        return getBpmnModel(processDefinitionKey)
            ?.getModelElementsByType(ZeebeInput::class.java)
            ?.map { it.source }
            ?.flatMap { findReferencedSecrets(it) }
            ?.distinct()
            ?: emptyList()
    }

    private fun getBpmnModel(processDefinitionKey: Long): BpmnModelInstance? {
        return processRepository.findByIdOrNull(processDefinitionKey)
            ?.bpmnXML
            ?.byteInputStream()
            ?.let { Bpmn.readModelFromStream(it) }
    }

    private fun findReferencedSecrets(text: String): List<String> {
        return secretRegex
            .findAll(text)
            .map { it.groupValues[1] }
            .toList()
    }

    fun findAvailableConnectors(): List<OutboundConnectorConfiguration> {
        return SPIConnectorDiscovery.discoverOutbound().toList()
    }

}