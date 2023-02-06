package org.camunda.community.zeebe.play.connectors

import io.camunda.connector.api.secret.SecretProvider
import io.camunda.connector.runtime.util.outbound.ConnectorJobHandler
import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.spring.client.lifecycle.ZeebeClientLifecycle
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
        if (zeebeClient is ZeebeClientLifecycle) {
            // The connectors are managed by the Spring Zeebe client itself.
            return
        }

        if (!connectorProperties.enabled) {
            logger.info("Zeebe connectors are disabled in the configuration.")
            // Disabling doesn't work if the connectors are managed by Spring Zeebe.
            // See https://github.com/camunda-community-hub/spring-zeebe/issues/325.
            return
        }

        connectorService
            .findAvailableConnectors()
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