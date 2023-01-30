package org.camunda.community.zeebe.play

import io.zeebe.zeeqs.data.entity.Process
import io.zeebe.zeeqs.data.repository.ProcessRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.graphql.test.tester.GraphQlTester
import java.time.Instant

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class GraphqlApiTests(
    @Autowired private val graphQlTester: GraphQlTester,
    @Autowired val processRepository: ProcessRepository
) {

    @BeforeEach
    fun `clean database`() {
        processRepository.deleteAll()
    }

    @Test
    fun `should query process`() {
        // given
        processRepository.save(
            Process(
                key = 1,
                bpmnProcessId = "process",
                version = 1,
                bpmnXML = "<...>",
                deployTime = Instant.now().toEpochMilli(),
                resourceName = "process.bpmn",
                checksum = "checksum"
            )
        );

        // when/then
        graphQlTester.document("""
                    {
                      processes {
                        nodes {
                          key
                          bpmnProcessId
                          version
                        }
                      }
                    }
                    """)
            .execute()
            .path("processes.nodes")
            .matchesJson("""
                    [
                        {
                          "key": "1",
                          "bpmnProcessId": "process",
                          "version": 1
                        }
                    ]              
                    """)
    }

}
