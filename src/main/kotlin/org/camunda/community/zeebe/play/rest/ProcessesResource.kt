package org.camunda.community.zeebe.play.rest

import io.camunda.zeebe.client.ZeebeClient
import io.camunda.zeebe.model.bpmn.Bpmn
import io.camunda.zeebe.model.bpmn.instance.*
import io.zeebe.zeeqs.data.entity.ProcessInstanceState
import io.zeebe.zeeqs.data.entity.TimerState
import io.zeebe.zeeqs.data.repository.*
import org.camunda.community.zeebe.play.connectors.ConnectorService
import org.camunda.community.zeebe.play.services.ZeebeClockService
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.*
import java.io.ByteArrayInputStream
import java.time.Duration
import java.time.Instant
import java.util.concurrent.Callable
import java.util.concurrent.Executors

private val RETRY_INTERVAL = Duration.ofMillis(100)

@RestController
@RequestMapping("/rest/processes")
class ProcessesResource(
    private val zeebeClient: ZeebeClient,
    private val connectorService: ConnectorService,
    private val processRepository: ProcessRepository,
    private val messageSubscriptionRepository: MessageSubscriptionRepository,
    private val messageCorrelationRepository: MessageCorrelationRepository,
    private val signalSubscriptionRepository: SignalSubscriptionRepository,
    private val processInstanceRepository: ProcessInstanceRepository,
    private val timerRepository: TimerRepository,
    private val clockService: ZeebeClockService
) {

    private val executor = Executors.newSingleThreadExecutor()

    @RequestMapping(path = ["/{processKey}"], method = [RequestMethod.POST])
    fun createInstance(
        @PathVariable("processKey") processKey: Long,
        @RequestBody variables: String
    ): Long {
        // hack for the web-modeler to deal with not none start events
        val process = processRepository.findByIdOrNull(processKey)
            ?.let { Bpmn.readModelFromStream(ByteArrayInputStream(it.bpmnXML.toByteArray())) }
            ?: throw RuntimeException("No process found with key '$processKey'")

        val startEvents = process.getModelElementsByType(StartEvent::class.java)
            .filter { it.scope is Process }

        if (startEvents.isEmpty()) {
            throw RuntimeException("No start event found.")
        }

        val noneStartEvent = startEvents.find { it.eventDefinitions.isEmpty() }

        return noneStartEvent?.let {
            createProcessInstanceWithNoneStartEvent(processKey, variables)
        }
            ?: if (startEvents.size > 1) {
                throw RuntimeException("More than one start event found but none of them is a none start event.")
            } else {
                return createProcessInstanceWithStartEvent(
                    processKey = processKey,
                    startEvent = startEvents.first(),
                    variables = variables
                )
            }
    }

    private fun createProcessInstanceWithNoneStartEvent(processKey: Long, variables: String) =
        zeebeClient.newCreateInstanceCommand()
            .processDefinitionKey(processKey)
            .variables(variables)
            .send()
            .join()
            .processInstanceKey

    private fun createProcessInstanceWithStartEvent(
        processKey: Long,
        startEvent: StartEvent,
        variables: String
    ): Long {

        if (startEvent.eventDefinitions.any { it is MessageEventDefinition }) {
            return createProcessInstanceWithMessageStartEvent(processKey, variables)
        } else if (startEvent.eventDefinitions.any { it is TimerEventDefinition }) {
            return createProcessInstanceWithTimerStartEvent(processKey)
        } else if (startEvent.eventDefinitions.any { it is SignalEventDefinition }) {
            return createProcessInstanceWithSignalStartEvent(processKey, variables)
        } else {
            val type = startEvent.eventDefinitions.first().elementType.typeName
            throw RuntimeException("Can't start process instance with start event of type '$type'")
        }
    }

    private fun createProcessInstanceWithMessageStartEvent(
        processKey: Long,
        variables: String
    ): Long {
        val messageSubscription = messageSubscriptionRepository
            .findByProcessDefinitionKeyAndElementInstanceKeyIsNull(processKey)
            .firstOrNull()
            ?: throw RuntimeException("No message subscription found for process '$processKey'")

        val messageKey = zeebeClient.newPublishMessageCommand()
            .messageName(messageSubscription.messageName)
            .correlationKey("")
            .variables(variables)
            .timeToLive(Duration.ZERO)
            .send()
            .join()
            .messageKey

        return executor.submit(Callable {
            getProcessInstanceKeyForMessage(
                processKey = processKey,
                messageKey = messageKey
            )
        }).get()
    }

    private fun getProcessInstanceKeyForMessage(processKey: Long, messageKey: Long): Long {
        var processInstanceKey = -1L
        while (processInstanceKey < 0) {
            processInstanceKey =
                messageCorrelationRepository.findByMessageKey(messageKey = messageKey)
                    .firstOrNull { it.processDefinitionKey == processKey }
                    ?.processInstanceKey
                    ?: run {
                        // wait and retry
                        Thread.sleep(RETRY_INTERVAL.toMillis())
                        -1L
                    }
        }
        return processInstanceKey
    }

    private fun createProcessInstanceWithTimerStartEvent(processKey: Long): Long {
        val timer =
            (timerRepository.findByProcessDefinitionKeyAndElementInstanceKeyIsNull(processKey)
                .firstOrNull { it.state == TimerState.CREATED }
                ?: throw RuntimeException("No timer found for process '$processKey'"))

        val currentTime = clockService.getCurrentTime()
        val duration = Duration.between(currentTime, Instant.ofEpochMilli(timer.dueDate))
        clockService.increaseTime(duration)

        return executor.submit(Callable {
            getProcessInstanceForTimer(
                timerKey = timer.key
            )
        }).get()
    }

    private fun getProcessInstanceForTimer(timerKey: Long): Long {
        var processInstanceKey = -1L
        while (processInstanceKey < 0) {
            processInstanceKey =
                timerRepository.findByIdOrNull(timerKey)
                    ?.takeIf { it.state == TimerState.TRIGGERED }
                    ?.processInstanceKey
                    ?: run {
                        // wait and retry
                        Thread.sleep(RETRY_INTERVAL.toMillis())
                        -1L
                    }
        }
        return processInstanceKey
    }

    private fun createProcessInstanceWithSignalStartEvent(
        processKey: Long,
        variables: String
    ): Long {
        val signalSubscription = signalSubscriptionRepository
            .findByProcessDefinitionKey(processKey)
            .firstOrNull()
            ?: throw RuntimeException("No signal subscription found for process '$processKey'")

        val signalKey = zeebeClient.newBroadcastSignalCommand()
            .signalName(signalSubscription.signalName)
            .variables(variables)
            .send()
            .join()
            .key

        return executor.submit(Callable {
            getProcessInstanceKeyForSignal(
                processKey = processKey,
                signalKey = signalKey
            )
        }).get()
    }

    private fun getProcessInstanceKeyForSignal(processKey: Long, signalKey: Long): Long {
        var processInstanceKey = -1L
        while (processInstanceKey < 0) {
            processInstanceKey =
                processInstanceRepository.findByProcessDefinitionKeyAndStateIn(
                    processDefinitionKey = processKey,
                    stateIn = listOf(
                        ProcessInstanceState.ACTIVATED,
                        ProcessInstanceState.COMPLETED,
                        ProcessInstanceState.TERMINATED
                    ),
                    pageable = PageRequest.of(0, 1000)
                )
                    // since the signal was broadcast first, the signal key should be higher
                    .firstOrNull { it.key > signalKey }
                    ?.key
                    ?: run {
                        // wait and retry
                        Thread.sleep(RETRY_INTERVAL.toMillis())
                        -1L
                    }
        }
        return processInstanceKey
    }

    @RequestMapping(
        path = ["/{processKey}/missing-connector-secrets"],
        method = [RequestMethod.GET]
    )
    fun findMissingConnectorSecrets(@PathVariable("processKey") processKey: Long): MissingConnectorSecretsDto {
        return MissingConnectorSecretsDto(
            connectorSecretNames = connectorService.getMissingConnectorSecrets(
                processDefinitionKey = processKey
            )
        )
    }

    data class MissingConnectorSecretsDto(
        val connectorSecretNames: List<String>
    )

}