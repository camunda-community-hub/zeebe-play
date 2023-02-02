package org.camunda.community.zeebe.play.rest

import org.camunda.community.zeebe.play.connectors.ConnectorSecret
import org.camunda.community.zeebe.play.connectors.ConnectorSecretRepository
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/connector-secrets")
class ConnectorSecretsResource(
    private val repository: ConnectorSecretRepository
) {

    @RequestMapping(method = [RequestMethod.GET])
    fun getSecrets(): ConnectorSecretsDto {
        return repository.findAll()
            .map {
                ConnectSecretDto(
                    name = it.name,
                    value = it.value
                )
            }.let {
                ConnectorSecretsDto(
                    secrets = it
                )
            }
    }

    @RequestMapping(method = [RequestMethod.POST])
    fun setSecrets(@RequestBody dto: ConnectorSecretsDto) {
        // place all secrets with the request data
        repository.deleteAll()

        dto.secrets
            .map {
                ConnectorSecret(
                    name = it.name,
                    value = it.value
                )
            }
            .let {
                repository.saveAll(it)
            }
    }

    data class ConnectorSecretsDto(
        val secrets: List<ConnectSecretDto>
    )

    data class ConnectSecretDto(
        val name: String,
        val value: String
    )
}