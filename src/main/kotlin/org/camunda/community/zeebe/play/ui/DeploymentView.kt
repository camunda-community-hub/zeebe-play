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
        addPageInfoToModel(model, "overview")
        return "views/deployment/deployment"
    }

    @GetMapping("/process/{key}")
    fun process(@PathVariable("key") processKey: Long, model: Model): String {
        model.addAttribute("processKey", processKey)
        addPageInfoToModel(model, "process")
        return "views/deployment/process/process"
    }

    @GetMapping("/decision/{key}")
    fun decision(@PathVariable("key") decisionKey: Long, model: Model): String {
        model.addAttribute("decisionKey", decisionKey)
        addPageInfoToModel(model, "decision")
        return "views/deployment/decision/decision"
    }

    private fun addPageInfoToModel(model: Model, view: String) {
        model.addAttribute("page", "deployment")
        model.addAttribute("view", view)
    }

}