package org.camunda.community.zeebe.play.zeebe

import io.camunda.zeebe.client.ZeebeClient
import io.zeebe.hazelcast.exporter.HazelcastExporter
import org.camunda.community.eze.EngineFactory
import org.camunda.community.eze.ZeebeEngine
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.time.Duration
import java.time.Instant

@Configuration
@Profile("!remote-engine")
open class EmbeddedZeebeConfig {

    @Bean
    open fun embeddedZeebeService(engine: ZeebeEngine): ZeebeService {
        return EmbeddedZeebeService(engine)
    }

    @Bean
    open fun embeddedZeebeEngine(): ZeebeEngine {
        return EngineFactory.create(
            exporters = listOf(HazelcastExporter())
        )
    }

    @Bean
    open fun zeebeClient(engine: ZeebeEngine): ZeebeClient {
        return engine.createClient()
    }

    class EmbeddedZeebeService(val engine: ZeebeEngine): ZeebeService {

        private val logger = LoggerFactory.getLogger(EmbeddedZeebeService::class.java)

        override fun start() {
            logger.info("Start embedded Zeebe engine")
            engine.start()
        }

        override fun stop() {
            logger.info("Stop embedded Zeebe engine")
            engine.stop()
        }

        override fun getCurrentTime(): Instant {
            return engine.clock().getCurrentTime()
        }

        override fun increaseTime(duration: Duration): Long {
            engine.clock().increaseTime(timeToAdd = duration)
            return getCurrentTime().toEpochMilli()
        }
    }

}