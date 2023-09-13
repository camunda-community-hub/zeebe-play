package org.camunda.community.zeebe.play.actuators

import org.camunda.community.zeebe.play.zeebe.ZeebeService
import org.springframework.boot.actuate.availability.ReadinessStateHealthIndicator
import org.springframework.boot.availability.ApplicationAvailability
import org.springframework.boot.availability.AvailabilityState
import org.springframework.boot.availability.ReadinessState
import org.springframework.stereotype.Component

@Component
class ZeebeEngineReadinessIndicator(
    availability: ApplicationAvailability,
    private val zeebeService: ZeebeService
) : ReadinessStateHealthIndicator(availability) {

    override fun getState(applicationAvailability: ApplicationAvailability): AvailabilityState {
        return when (zeebeService.isRunning()) {
            true -> ReadinessState.ACCEPTING_TRAFFIC
            else -> ReadinessState.REFUSING_TRAFFIC
        }
    }

}
