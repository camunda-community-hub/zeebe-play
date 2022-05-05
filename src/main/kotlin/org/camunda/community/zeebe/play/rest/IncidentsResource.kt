package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/rest/incidents")
class IncidentsResource(private val zeebeClient: ZeebeClient) {

    @RequestMapping(path = ["/{incidentKey}/resolve"], method = [RequestMethod.POST])
    fun resolve(@PathVariable("incidentKey") incidentKey: Long) {

        zeebeClient.newResolveIncidentCommand(incidentKey)
            .send()
            .join()
    }

}