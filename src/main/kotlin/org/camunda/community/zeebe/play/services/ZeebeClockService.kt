package org.camunda.community.zeebe.play.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import org.camunda.community.zeebe.play.rest.ZeebeServiceException
import org.camunda.community.zeebe.play.zeebe.ZeebeService
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.time.Instant

@Component
class ZeebeClockService(private val zeebeService: ZeebeService) {

    fun increaseTime(duration: Duration): Long {
        return zeebeService.increaseTime(duration)
    }

    fun getCurrentTime(): Instant {
        return zeebeService.getCurrentTime()
    }

}