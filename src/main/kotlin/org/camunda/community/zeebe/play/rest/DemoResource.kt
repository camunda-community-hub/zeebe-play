package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/rest/demo")
class DemoResource(private val zeebeClient: ZeebeClient) {

    @RequestMapping(path = ["/"], method = [RequestMethod.POST])
    fun deployDemoResources(): Long {

        val deployCommand = zeebeClient
            .newDeployResourceCommand()
            .addResourceFromClasspath("demo/play-demo.bpmn")

        return deployCommand
            .send()
            .join()
            .processes
            .first()
            .processDefinitionKey;
    }

}