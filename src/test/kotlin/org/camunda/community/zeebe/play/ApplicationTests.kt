package org.camunda.community.zeebe.play

import org.assertj.core.api.Assertions.assertThat
import org.camunda.community.zeebe.play.ui.MainView
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApplicationTests(
    @Autowired
    private val mainView: MainView
) {

    @Test
    fun `should start application`() {
        assertThat(mainView).isNotNull();
    }

}
