package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Component
class MainView {

    @GetMapping("/")
    fun index(): String {
        return home()
    }

    @GetMapping("/view/home")
    fun home(): String {
        return "views/home"
    }
}