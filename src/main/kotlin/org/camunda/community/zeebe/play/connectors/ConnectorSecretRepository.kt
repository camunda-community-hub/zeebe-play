package org.camunda.community.zeebe.play.connectors

import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface ConnectorSecretRepository: PagingAndSortingRepository<ConnectorSecret, String> {
}