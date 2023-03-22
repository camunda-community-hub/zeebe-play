package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping

@Component
@RequestMapping("/view")
class MonitoringView {

    @GetMapping("/monitoring")
    fun monitoring(model: Model): String {
        addPageInfoToModel(model, "overview")
        return "views/monitoring/monitoring"
    }

    @GetMapping("/process-instance/{key}")
    fun processInstance(@PathVariable("key") processInstanceKey: Long, model: Model): String {
        model.addAttribute("processInstanceKey", processInstanceKey)
        addPageInfoToModel(model, "process-instance")
        return "views/monitoring/process-instances/process-instance"
    }

    @GetMapping("/decision-evaluation/{key}")
    fun decisionEvaluation(@PathVariable("key") decisionEvaluationKey: Long, model: Model): String {
        model.addAttribute("decisionEvaluationKey", decisionEvaluationKey)
        addPageInfoToModel(model, "decision-evaluation")
        return "views/monitoring/decision-evaluations/decision-evaluation"
    }

    private fun addPageInfoToModel(model: Model, view: String) {
        model.addAttribute("page", "monitoring")
        model.addAttribute("view", view)
    }

}