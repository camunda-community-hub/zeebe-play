package org.camunda.community.zeebe.play.connectors

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id

@Entity
data class ConnectorSecret(
    @Id val name: String,
    @Column(name = "value_") val value: String
)
