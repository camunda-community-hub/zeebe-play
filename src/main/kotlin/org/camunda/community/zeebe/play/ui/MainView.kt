package org.camunda.community.zeebe.play.ui

import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Component
@RequestMapping("/view")
class MainView {

    @GetMapping("/main")
    fun main(): String {
        return "main"
    }

    @GetMapping("/home")
    fun home(): String {
        return "views/home"
    }
}