package org.camunda.community.zeebe.play.connectors

import io.camunda.connector.api.secret.SecretProvider
import io.camunda.connector.runtime.core.ConnectorHelper
import io.camunda.connector.runtime.core.outbound.ConnectorJobHandler
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
    private val connectorSecretRepository: ConnectorSecretRepository,
    private val connectorService: ConnectorService
) {

    private val logger = LoggerFactory.getLogger(ConnectorsConfig::class.java)

    @PostConstruct
    fun startConnectors() {
        if (connectorProperties.mode == ConnectorProperties.ConnectorsMode.ACTIVE) {
            // start all connectors
            connectorService
                .findAvailableConnectors()
                .forEach { connectorConfig ->
                    val connector =
                        ConnectorHelper.instantiateConnector(connectorConfig.connectorClass)
                    val jobHandler = ConnectorJobHandler(connector, secretProvider)

                    zeebeClient
                        .newWorker()
                        .jobType(connectorConfig.type)
                        .handler(jobHandler)
                        .name(connectorConfig.name)
                        .fetchVariables(connectorConfig.inputVariables.toList())
                        .open()

                    logger.info("Start Zeebe connector. [name: '${connectorConfig.name}', type: '${connectorConfig.type}']")
                }
        }
    }

    @PostConstruct
    fun storeConnectorSecrets() {
        connectorProperties.secrets.forEach {
            val secret = ConnectorSecret(
                name = it.name,
                value = it.value
            )
            connectorSecretRepository.save(secret)
        }
    }

}