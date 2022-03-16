package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.api.command.ClientException
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest

@ControllerAdvice
class RuntimeExceptionHandler {

    @ExceptionHandler(value = [ClientException::class])
    fun handleZeebeClientException(
        ex: ClientException, request: WebRequest?
    ): ResponseEntity<Any>? {
        return ResponseEntity.status(HttpStatus.FAILED_DEPENDENCY)
            .contentType(MediaType.APPLICATION_JSON)
            .body(ZeebeFailure(message = ex.message ?: "?"))
    }

}