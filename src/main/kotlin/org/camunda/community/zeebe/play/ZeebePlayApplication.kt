package org.camunda.community.zeebe.play


import io.camunda.connector.runtime.OutboundConnectorsAutoConfiguration
import org.camunda.community.zeebe.play.services.HazelcastService
import org.camunda.community.zeebe.play.zeebe.ZeebeService
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.web.config.EnableSpringDataWebSupport
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy


@SpringBootApplication(exclude = [OutboundConnectorsAutoConfiguration::class])
@EnableSpringDataWebSupport
open class ZeebePlayApplication(
    private val hazelcastService: HazelcastService,
    private val zeebeService: ZeebeService
) {

    @PostConstruct
    fun init() {
        zeebeService.start()
        hazelcastService.start()
    }

    @PreDestroy
    fun stop() {
        hazelcastService.stop()
        zeebeService.stop()
    }

}

fun main(args: Array<String>) {
    runApplication<ZeebePlayApplication>(*args)
}

