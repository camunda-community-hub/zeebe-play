package org.camunda.community.zeebe.play.rest

class ZeebeServiceException(
    val service: String,
    val status: String,
    val failureMessage: String
): Exception("Failed to invoke $service [status: $status, message: $failureMessage]") {
}