package org.camunda.community.zeebe.play.rest

import org.camunda.community.zeebe.play.services.ZeebeClockService
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.time.Duration
import java.time.Instant
import java.time.ZonedDateTime

@RestController
@RequestMapping("/rest/timers")
class TimersResource(
    private val clockService: ZeebeClockService
) {

    @RequestMapping(method = [RequestMethod.POST])
    fun increaseTime(@RequestBody command: TimeTravelCommand): Long {

        var newTime = -1L

        command.duration?.let {
            val duration = Duration.parse(it)

            newTime = clockService.increaseTime(duration)
        }

        command.dateTime?.let {
            val dateTime = ZonedDateTime.parse(it)
            val duration = Duration.between(Instant.now(), dateTime)

            newTime = clockService.increaseTime(duration)
        }

        return newTime
    }

    data class TimeTravelCommand(
        val duration: String?,
        val dateTime: String?
    )

}