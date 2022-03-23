package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping

@Component
@RequestMapping("/view")
class DeploymentView {

    @GetMapping("/deployment")
    fun deployment(model: Model): String {
        model.addAttribute("page", "deployment")
        return "views/deployment"
    }

    @GetMapping("/process/{key}")
    fun process(@PathVariable("key") processKey: Long, model: Model): String {
        model.addAttribute("processKey", processKey)
        model.addAttribute("page", "deployment")
        return "views/process/process"
    }

}