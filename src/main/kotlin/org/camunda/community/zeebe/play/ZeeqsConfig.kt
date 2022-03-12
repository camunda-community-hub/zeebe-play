package org.camunda.community.zeebe.play

import io.zeebe.zeeqs.importer.hazelcast.HazelcastProperties
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableCaching
@EnableConfigurationProperties(HazelcastProperties::class)
@EnableJpaRepositories(basePackages = ["io.zeebe.zeeqs"])
@EntityScan(basePackages = ["io.zeebe.zeeqs"])
@ComponentScan(basePackages = ["io.zeebe.zeeqs"])
open class ZeeqsConfig {
    // ZeeQS specific configs
    // - load JPA repositories and entities from ZeeQS
    // - load importer properties
}