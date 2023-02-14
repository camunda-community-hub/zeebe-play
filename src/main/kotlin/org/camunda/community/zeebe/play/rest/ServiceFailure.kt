package org.camunda.community.zeebe.play.rest

data class ServiceFailure(
    val message: String,
    val failureType: ServiceFailureType = ServiceFailureType.UNKNOWN,
    val details: String? = null
)

enum class ServiceFailureType {
    UNKNOWN, COMMAND_REJECTION
}