package org.camunda.community.zeebe.play

import io.zeebe.zeeqs.data.entity.Process
import io.zeebe.zeeqs.data.repository.ProcessRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.web.servlet.MockMvc
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Instant

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class GraphqlApiTests(
    @Autowired val mvc: MockMvc,
    @LocalServerPort val port: Int,
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

        // when
        val response = sendQuery("{processes{nodes{key,bpmnProcessId,version}}}")

        // then
        assertThat(response).isEqualToIgnoringWhitespace(
            """
            {"data":
            {"processes":
            {"nodes":[
            {"key":"1",
            "bpmnProcessId":"process", 
            "version":1}
            ]}}}""".trimIndent()
        )
    }

    private fun sendQuery(query: String): String {

//        - MVC returns 404 for unknown reason
//        return mvc.perform(
//            post("http://localhost:$port/graphql")
//                .contentType(MediaType.APPLICATION_JSON)
//                .accept(MediaType.APPLICATION_JSON)
//                .content("""{"query": "query TestQuery $query"}""")
//        )
//            .andExpect(status().isOk())
//            .andReturn()
//            .response
//            .contentAsString

        val request = HttpRequest.newBuilder()
            .uri(URI("http://localhost:$port/graphql"))
            .POST(
                HttpRequest.BodyPublishers.ofString(
                    """{"query": "query TestQuery $query"}"""
                )
            )
            .build()

        val response = HttpClient
            .newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString())

        assertThat(response.statusCode()).isEqualTo(200)

        return response.body()
    }

}
