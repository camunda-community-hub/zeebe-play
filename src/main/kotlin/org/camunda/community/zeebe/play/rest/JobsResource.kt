package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/rest/jobs")
class JobsResource(private val zeebeClient: ZeebeClient) {

    @RequestMapping(path = ["/{jobKey}/complete"], method = [RequestMethod.POST])
    fun complete(@PathVariable("jobKey") jobKey: Long, @RequestBody command: CompleteJobCommand) {

        zeebeClient.newCompleteCommand(jobKey)
            .variables(command.variables)
            .send()
            .join()
    }

    @RequestMapping(path = ["/{jobKey}/fail"], method = [RequestMethod.POST])
    fun fail(@PathVariable("jobKey") jobKey: Long, @RequestBody command: FailJobCommand) {

        zeebeClient.newFailCommand(jobKey)
            .retries(command.retries)
            .errorMessage(command.errorMessage)
            .send()
            .join()
    }

    @RequestMapping(path = ["/{jobKey}/throw-error"], method = [RequestMethod.POST])
    fun throwError(@PathVariable("jobKey") jobKey: Long, @RequestBody command: ThrowErrorJobCommand) {

        zeebeClient.newThrowErrorCommand(jobKey)
            .errorCode(command.errorCode)
            .errorMessage(command.errorMessage)
            .send()
            .join()
    }

    data class CompleteJobCommand(val variables: String)
    data class FailJobCommand(val errorMessage: String, val retries: Int)
    data class ThrowErrorJobCommand(val errorCode: String, val errorMessage: String)

}