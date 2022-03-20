package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

@RestController
@RequestMapping("/rest/messages")
class MessagesResource(private val zeebeClient: ZeebeClient) {

    @RequestMapping(method = [RequestMethod.POST])
    fun publishMessage(@RequestBody command: PublishMessageCommand): Long {

        return zeebeClient.newPublishMessageCommand()
            .messageName(command.messageName)
            .correlationKey(command.correlationKey ?: "")
            .variables(command.variables ?: "{}")
            .timeToLive(command.timeToLive ?.takeIf { it.isNotBlank() } ?.let { Duration.parse(it) } ?: Duration.ZERO)
            .messageId(command.messageId ?: "")
            .send()
            .join()
            .messageKey
    }

    data class PublishMessageCommand(
        val messageName: String,
        val correlationKey: String?,
        val variables: String?,
        val timeToLive: String?,
        val messageId: String?
    )

}