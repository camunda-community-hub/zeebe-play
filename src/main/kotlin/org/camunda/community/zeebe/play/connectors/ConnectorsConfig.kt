package org.camunda.community.zeebe.play.connectors

import io.camunda.connector.api.secret.SecretProvider
import io.camunda.connector.runtime.util.outbound.ConnectorJobHandler
import io.camunda.connector.runtime.util.outbound.OutboundConnectorRegistrationHelper
import io.camunda.zeebe.client.ZeebeClient
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import javax.annotation.PostConstruct

@Configuration
@EnableJpaRepositories
@EntityScan
@EnableConfigurationProperties(ConnectorProperties::class)
class ConnectorsConfig(
    private val zeebeClient: ZeebeClient,
    private val secretProvider: SecretProvider,
    private val connectorProperties: ConnectorProperties,
    private val connectorSecretRepository: ConnectorSecretRepository
) {

    private val logger = LoggerFactory.getLogger(ConnectorsConfig::class.java)

    @PostConstruct
    fun `start connectors`() {

        OutboundConnectorRegistrationHelper
            .parseFromSPI()
            .forEach { connectorConfig ->
                zeebeClient
                    .newWorker()
                    .jobType(connectorConfig.type)
                    .handler(ConnectorJobHandler(connectorConfig.function, secretProvider))
                    .name(connectorConfig.name)
                    .fetchVariables(connectorConfig.inputVariables.toList())
                    .open()

                logger.info("Start Zeebe connector. [name: '${connectorConfig.name}', type: '${connectorConfig.type}']")
            }
    }

    @PostConstruct
    fun `store connector secrets`() {
        connectorProperties.secrets.forEach {
            val secret = ConnectorSecret(
                name = it.name,
                value = it.value
            )
            connectorSecretRepository.save(secret)
        }
    }

}