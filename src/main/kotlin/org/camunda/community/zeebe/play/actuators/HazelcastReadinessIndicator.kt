package org.camunda.community.zeebe.play.actuators

import org.camunda.community.zeebe.play.services.HazelcastService
import org.springframework.boot.actuate.availability.ReadinessStateHealthIndicator
import org.springframework.boot.availability.ApplicationAvailability
import org.springframework.boot.availability.AvailabilityState
import org.springframework.boot.availability.ReadinessState
import org.springframework.stereotype.Component

@Component
class HazelcastReadinessIndicator(
    availability: ApplicationAvailability,
    private val hazelcastService: HazelcastService
) : ReadinessStateHealthIndicator(availability) {

    override fun getState(applicationAvailability: ApplicationAvailability): AvailabilityState {
        return when (hazelcastService.isRunning()) {
            true -> ReadinessState.ACCEPTING_TRAFFIC
            else -> ReadinessState.REFUSING_TRAFFIC
        }
    }

}
