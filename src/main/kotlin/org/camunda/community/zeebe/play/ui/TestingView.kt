package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Component
@RequestMapping("/view")
class TestingView {

    @GetMapping("/testing")
    fun monitoring(model: Model): String {
        addPageInfoToModel(model, "overview")
        return "views/testing"
    }

    private fun addPageInfoToModel(model: Model, view: String) {
        model.addAttribute("page", "testing")
        model.addAttribute("view", view)
    }

}