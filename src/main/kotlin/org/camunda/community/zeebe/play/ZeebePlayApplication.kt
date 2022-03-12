package org.camunda.community.zeebe.play


import io.zeebe.zeeqs.importer.hazelcast.HazelcastImporter
import io.zeebe.zeeqs.importer.hazelcast.HazelcastProperties
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import javax.annotation.PostConstruct


@SpringBootApplication
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

