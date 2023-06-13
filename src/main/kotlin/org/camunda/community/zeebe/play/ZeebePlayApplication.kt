package org.camunda.community.zeebe.play


import io.camunda.connector.runtime.OutboundConnectorsAutoConfiguration
import io.zeebe.zeeqs.importer.hazelcast.HazelcastImporter
import io.zeebe.zeeqs.importer.hazelcast.HazelcastProperties
import org.camunda.community.zeebe.play.zeebe.ZeebeService
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.web.config.EnableSpringDataWebSupport
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy


@SpringBootApplication(exclude = [OutboundConnectorsAutoConfiguration::class])
@EnableSpringDataWebSupport
open class ZeebePlayApplication(
    val hazelcastProperties: HazelcastProperties,
    val hazelcastImporter: HazelcastImporter,
    val zeebeService: ZeebeService
) {

    private val logger = LoggerFactory.getLogger(ZeebePlayApplication::class.java)

    @PostConstruct
    fun init() {
        zeebeService.start()

        logger.info("Connecting to Hazelcast: '$hazelcastProperties'")
        hazelcastImporter.start(hazelcastProperties)
        logger.info("Connected to Hazelcast!")
    }

    @PreDestroy
    fun stop() {
        zeebeService.stop()
    }

}

fun main(args: Array<String>) {
    runApplication<ZeebePlayApplication>(*args)
}

