package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.client.api.response.PartitionBrokerHealth
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/status")
class StatusResource(
    private val zeebeClient: ZeebeClient
) {

    private val zeebePlayVersion: String = readZeebePlayVersion()

    @RequestMapping(method = [RequestMethod.GET])
    fun getStatus(): StatusDto {

        try {
            val topology = zeebeClient.newTopologyRequest()
                .send()
                .join()

            val zeebeVersion = topology.brokers.map { it.version }.firstOrNull() ?: "?"

            val zeebeStatus = topology.brokers
                .flatMap { it.partitions }
                .filter { it.isLeader }
                .map { it.health }
                .fold(ZeebeStatus.HEALTHY) { result, health ->
                    when (health) {
                        PartitionBrokerHealth.HEALTHY -> result
                        PartitionBrokerHealth.UNHEALTHY -> ZeebeStatus.UNHEALTHY
                        PartitionBrokerHealth.DEAD -> ZeebeStatus.UNHEALTHY
                        else -> ZeebeStatus.UNKNOWN
                    }
                }

            return StatusDto(
                zeebePlayVersion = zeebePlayVersion,
                zeebeEngineVersion = zeebeVersion,
                zeebeStatus = zeebeStatus
            )
        } catch (e: Exception) {
            return StatusDto(
                zeebePlayVersion = zeebePlayVersion,
                zeebeEngineVersion = "?",
                zeebeStatus = ZeebeStatus.UNHEALTHY
            )
        }

    }

    private fun readZeebePlayVersion(): String {
        return javaClass.getResource("/version.txt")
                ?.let { String(it.readBytes()) }
                ?: "?"
    }

    data class StatusDto(
        val zeebePlayVersion: String,
        val zeebeEngineVersion: String,
        val zeebeStatus: ZeebeStatus
    )

    enum class ZeebeStatus {
        HEALTHY, UNHEALTHY, UNKNOWN
    }

}