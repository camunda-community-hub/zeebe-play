package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.servlet.view.RedirectView

@Component
@RequestMapping
class MainView {

    @GetMapping("/")
    fun index(): RedirectView {
        return RedirectView("/view/home")
    }

    @GetMapping("/view/home")
    fun home(): String {
        return "views/home"
    }
}