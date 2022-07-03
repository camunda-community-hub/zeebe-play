package org.camunda.community.zeebe.play.zeebe

import io.camunda.zeebe.spring.client.EnableZeebeClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
@Profile("remote-engine")
@EnableZeebeClient
open class RemoteZeebeConfig {

    @Bean
    open fun remoteZeebeService(): ZeebeService {
        return RemoteZeebeService()
    }

    class RemoteZeebeService: ZeebeService {
        override fun start() {
            // the lifecycle is managed remotely
        }

        override fun stop() {
            // the lifecycle is managed remotely
        }
    }

}