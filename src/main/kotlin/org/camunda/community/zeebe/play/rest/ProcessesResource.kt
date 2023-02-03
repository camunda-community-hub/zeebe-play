package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.camunda.community.zeebe.play.connectors.ConnectorService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/rest/processes")
class ProcessesResource(
    private val zeebeClient: ZeebeClient,
    private val connectorService: ConnectorService
) {

    @RequestMapping(path = ["/{processKey}"], method = [RequestMethod.POST])
    fun createInstance(
        @PathVariable("processKey") processKey: Long,
        @RequestBody variables: String
    ): Long {

        return zeebeClient.newCreateInstanceCommand()
            .processDefinitionKey(processKey)
            .variables(variables)
            .send()
            .join()
            .processInstanceKey
    }

    @RequestMapping(
        path = ["/{processKey}/missing-connector-secrets"],
        method = [RequestMethod.GET]
    )
    fun findMissingConnectorSecrets(@PathVariable("processKey") processKey: Long): MissingConnectorSecretsDto {
        return MissingConnectorSecretsDto(
            connectorSecretNames = connectorService.getMissingConnectorSecrets(
                processDefinitionKey = processKey
            )
        )
    }

    data class MissingConnectorSecretsDto(
        val connectorSecretNames: List<String>
    )

}