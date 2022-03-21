package org.camunda.community.zeebe.play.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import org.camunda.community.zeebe.play.rest.ZeebeServiceException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

@Component
class ZeebeClockService {

    private val httpClient = HttpClient.newHttpClient()

    private val kotlinModule = KotlinModule.Builder().build()
    private val objectMapper = ObjectMapper().registerModule(kotlinModule)

    @Value(value = "\${zeebe.clock.endpoint}")
    private lateinit var zeebeClockEndpoint: String

    fun increaseTime(duration: Duration): Long {

        val offsetMilli = duration.toMillis()

        val requestBody = HttpRequest.BodyPublishers.ofString("""{ "offsetMilli": $offsetMilli }""")

        val request = HttpRequest.newBuilder()
            .uri(URI.create("http://$zeebeClockEndpoint/add"))
            .header("Content-Type", "application/json")
            .POST(requestBody)
            .build()

        val response = httpClient
            .send(request, HttpResponse.BodyHandlers.ofString())

        val statusCode = response.statusCode()
        val responseBody = response.body()

        if (statusCode != 200) {
            throw ZeebeServiceException(
                service = "time travel",
                status = statusCode.toString(),
                failureMessage = "$responseBody. Check if the clock endpoint is enables (zeebe.clock.controlled = true)."
            )
        }

        val clockResponse = objectMapper.readValue<ZeebeClockResponse>(responseBody)

        return clockResponse.epochMilli;
    }

    private data class ZeebeClockResponse(
        val epochMilli: Long,
        val instant: String
    )

}