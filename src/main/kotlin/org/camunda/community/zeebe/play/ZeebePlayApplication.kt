package org.camunda.community.zeebe.play


import io.zeebe.zeeqs.importer.hazelcast.HazelcastImporter
import io.zeebe.zeeqs.importer.hazelcast.HazelcastProperties
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.web.config.EnableSpringDataWebSupport
import javax.annotation.PostConstruct


@SpringBootApplication
@EnableSpringDataWebSupport
open class ZeebePlayApplication(
    val hazelcastProperties: HazelcastProperties,
    val hazelcastImporter: HazelcastImporter
) {

    private val logger = LoggerFactory.getLogger(ZeebePlayApplication::class.java)

    @PostConstruct
    fun init() {
        logger.info("Connecting to Hazelcast: '$hazelcastProperties'")
        hazelcastImporter.start(hazelcastProperties)
        logger.info("Connected to Hazelcast!")
    }

}

fun main(args: Array<String>) {
    runApplication<ZeebePlayApplication>(*args)
}

