package org.camunda.community.zeebe.play.zeebe

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.spring.client.properties.ZeebeClientConfigurationProperties
import org.camunda.community.zeebe.play.rest.ZeebeServiceException
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.time.Instant

@Configuration
@ConditionalOnProperty(name = ["zeebe.engine"], havingValue = "remote")
@EnableConfigurationProperties(ZeebeClientConfigurationProperties::class)
open class RemoteZeebeConfig {

    @Value(value = "\${zeebe.clock.endpoint}")
    private lateinit var zeebeClockEndpoint: String

    @Bean
    open fun remoteZeebeService(): ZeebeService {
        return RemoteZeebeService(zeebeClockEndpoint)
    }

    @Bean
    fun zeebeClient(config: ZeebeClientConfigurationProperties): ZeebeClient {
        // The Spring-Zeebe client is disabled (configuration issues with embedded engine).
        // Create the Zeebe client directly using the configuration from Spring-Zeebe.
        return ZeebeClient.newClient(config)
    }

    class RemoteZeebeService(val clockEndpoint: String) : ZeebeService {

        private val httpClient = HttpClient.newHttpClient()

        private val kotlinModule = KotlinModule.Builder().build()
        private val objectMapper = ObjectMapper().registerModule(kotlinModule)

        override fun start() {
            // the lifecycle is managed remotely
        }

        override fun stop() {
            // the lifecycle is managed remotely
        }

        override fun getCurrentTime(): Instant {
            val clockResponse = sendRequest(
                request = HttpRequest.newBuilder()
                    .uri(URI.create("http://$clockEndpoint"))
                    .header("Content-Type", "application/json")
                    .GET()
                    .build()
            )
            return Instant.parse(clockResponse.instant);
        }

        override fun increaseTime(duration: Duration): Long {
            val offsetMilli = duration.toMillis()
            val requestBody =
                HttpRequest.BodyPublishers.ofString("""{ "offsetMilli": $offsetMilli }""")

            val clockResponse = sendRequest(
                request = HttpRequest.newBuilder()
                    .uri(URI.create("http://$clockEndpoint/add"))
                    .header("Content-Type", "application/json")
                    .POST(requestBody)
                    .build()
            )
            return clockResponse.epochMilli;
        }

        private fun sendRequest(request: HttpRequest): ZeebeClockResponse {

            val response = httpClient
                .send(request, HttpResponse.BodyHandlers.ofString())

            val statusCode = response.statusCode()
            val responseBody = response.body()

            if (statusCode != 200) {
                throw ZeebeServiceException(
                    service = "time travel",
                    status = statusCode.toString(),
                    failureMessage = "$responseBody. Check if the clock endpoint is enabled (zeebe.clock.controlled = true)."
                )
            }

            return objectMapper.readValue<ZeebeClockResponse>(responseBody)
        }

        private data class ZeebeClockResponse(
            val epochMilli: Long,
            val instant: String
        )
    }

}