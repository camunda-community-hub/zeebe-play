package org.camunda.community.zeebe.play

import org.assertj.core.api.Assertions.assertThat
import org.camunda.community.zeebe.play.ui.MainView
import org.camunda.community.zeebe.play.zeebe.ZeebeService
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import javax.annotation.PreDestroy


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ApplicationTests(
    @Autowired
    private val mainView: MainView
) {

    @Test
    fun `should start application`() {
        assertThat(mainView).isNotNull();
    }

}
