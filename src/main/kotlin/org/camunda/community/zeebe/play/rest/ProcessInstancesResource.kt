package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/rest/process-instances")
class ProcessInstancesResource(private val zeebeClient: ZeebeClient) {

    @RequestMapping(path = ["/{processInstanceKey}"], method = [RequestMethod.DELETE])
    fun cancel(@PathVariable("processInstanceKey") processInstanceKey: Long) {

        zeebeClient.newCancelInstanceCommand(processInstanceKey)
            .send()
            .join()
    }

    @RequestMapping(path = ["/{processInstanceKey}/variables"], method = [RequestMethod.POST])
    fun setVariables(@PathVariable("processInstanceKey") processInstanceKey: Long, @RequestBody command: SetVariablesCommand): Long {

        return zeebeClient.newSetVariablesCommand(command.scopeKey)
            .variables(command.variables)
            .local(true)
            .send()
            .join()
            .key
    }

    data class SetVariablesCommand(
        val scopeKey: Long,
        val variables: String)

}