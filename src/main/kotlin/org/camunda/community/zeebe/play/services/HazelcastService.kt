package org.camunda.community.zeebe.play.services

import io.zeebe.zeeqs.importer.hazelcast.HazelcastImporter
import io.zeebe.zeeqs.importer.hazelcast.HazelcastProperties
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class HazelcastService(
    val hazelcastProperties: HazelcastProperties,
    val hazelcastImporter: HazelcastImporter,
) {

    private val logger = LoggerFactory.getLogger(HazelcastService::class.java)

    private var isRunning = false

    fun start() {
        logger.info("Connecting to Hazelcast: '$hazelcastProperties'")
        hazelcastImporter.start(hazelcastProperties)
        logger.info("Connected to Hazelcast!")

        isRunning = true
    }

    fun stop() {
        logger.info("Stopping Hazelcast")
        hazelcastImporter.stop()

        isRunning = false
    }

    fun isRunning(): Boolean {
        return isRunning
    }

}