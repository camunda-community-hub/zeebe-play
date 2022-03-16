package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/processes")
class ProcessesResources(private val zeebeClient: ZeebeClient) {

    @RequestMapping(path = ["/{processKey}"], method = [RequestMethod.POST])
    fun createInstance(@PathVariable("processKey") processKey: Long, @RequestBody variables: String): Long {

        return zeebeClient.newCreateInstanceCommand()
            .processDefinitionKey(processKey)
            .variables(variables)
            .send()
            .join()
            .processInstanceKey
    }

}