package org.camunda.community.zeebe.play

import io.zeebe.zeeqs.data.entity.Process
import io.zeebe.zeeqs.data.repository.ProcessRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.groups.Tuple.tuple
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class WebAppTests(
    @Autowired val mvc: MockMvc,
    @Autowired val processRepository: ProcessRepository
) {

    @Test
    fun `should deploy demo process`() {
        // when
        mvc.perform(
            post("/rest/demo/")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk())

        // then
        assertThat(processRepository.findAll())
            .hasSize(1)
            .extracting(Process::bpmnProcessId)
            .contains(tuple("play-demo"))
    }

}
