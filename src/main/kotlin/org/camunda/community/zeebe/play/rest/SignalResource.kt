package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/signals")
class SignalResource(private val zeebeClient: ZeebeClient) {

    @RequestMapping(method = [RequestMethod.POST])
    fun broadcastSignal(@RequestBody command: BroadcastSignalCommand): Long {
        return zeebeClient.newBroadcastSignalCommand()
            .signalName(command.signalName)
            .variables(command.variables)
            .send()
            .join()
            .key
    }

    data class BroadcastSignalCommand(
        val signalName: String,
        val variables: String?
    )

}