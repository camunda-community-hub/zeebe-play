package org.camunda.community.zeebe.play.ui

import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.RequestMapping
import javax.servlet.RequestDispatcher
import javax.servlet.http.HttpServletRequest

@Controller
class ErrorController : ErrorController {

    @RequestMapping("/error")
    fun renderErrorPage(request: HttpServletRequest, model: Model): String {

        val statusCode: String? = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE)
            ?.toString()
        val status = statusCode?.let { "Status code: $it" } ?: "Oops..."
        model.addAttribute("status", status)

        val message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE)
            ?.takeIf { it is String && it.isNotEmpty() }
            ?: "We’re sorry! Something went wrong."
        model.addAttribute("message", message)

        return when (statusCode) {
            "404" -> "error/404"
            else -> "error"
        }
    }

}