package org.camunda.community.zeebe.play.connectors

import io.camunda.connector.api.secret.SecretProvider
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component

@Component
class ConnectorsSecretProvider(
    private val connectorSecretRepository: ConnectorSecretRepository
) : SecretProvider {

    override fun getSecret(name: String): String? {
        return connectorSecretRepository.findByIdOrNull(name)?.value
    }
}