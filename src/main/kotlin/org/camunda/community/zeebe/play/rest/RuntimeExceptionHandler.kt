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
            .body(ServiceFailure(message = ex.message ?: "?"))
    }

    @ExceptionHandler(value = [ZeebeServiceException::class])
    fun handleZeebeServiceException(
        ex: ZeebeServiceException, request: WebRequest?
    ): ResponseEntity<Any>? {
        return ResponseEntity.status(HttpStatus.FAILED_DEPENDENCY)
            .contentType(MediaType.APPLICATION_JSON)
            .body(ServiceFailure(message = ex.failureMessage))
    }

    @ExceptionHandler(value = [RuntimeException::class])
    fun handleRuntimeException(
        ex: java.lang.RuntimeException, request: WebRequest?
    ): ResponseEntity<Any>? {
        return ResponseEntity.status(HttpStatus.FAILED_DEPENDENCY)
            .contentType(MediaType.APPLICATION_JSON)
            .body(ServiceFailure(message = ex.message ?: "?"))
    }

}