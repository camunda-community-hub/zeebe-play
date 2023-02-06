package org.camunda.community.zeebe.play.rest

import org.camunda.community.zeebe.play.connectors.ConnectorService
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/connectors")
class ConnectorsResource(
    private val connectorService: ConnectorService
) {

    @RequestMapping(method = [RequestMethod.GET])
    fun getAvailableConnectors(): ConnectorsDto {
        return ConnectorsDto(
            connectors = connectorService
                .findAvailableConnectors()
                .map { ConnectDto(name = it.name, type = it.type) }
        )
    }

    data class ConnectorsDto(
        val connectors: List<ConnectDto>
    )

    data class ConnectDto(
        val name: String,
        val type: String
    )
}