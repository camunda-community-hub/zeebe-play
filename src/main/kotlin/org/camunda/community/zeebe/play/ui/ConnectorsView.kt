package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Component
@RequestMapping("/view")
class ConnectorsView {

    @GetMapping("/connectors")
    fun connectors(model: Model): String {
        addPageInfoToModel(model, "overview")
        return "views/connectors/connectors"
    }

    private fun addPageInfoToModel(model: Model, view: String) {
        model.addAttribute("page", "connectors")
        model.addAttribute("view", view)
    }

}