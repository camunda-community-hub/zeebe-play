package org.camunda.community.zeebe.play

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import io.camunda.zeebe.model.bpmn.Bpmn
import io.zeebe.zeeqs.data.repository.DecisionRepository
import io.zeebe.zeeqs.data.repository.DecisionRequirementsRepository
import io.zeebe.zeeqs.data.repository.ProcessRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.awaitility.kotlin.await
import org.camunda.community.zeebe.play.rest.DeploymentsResource
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInfo
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class DeploymentTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val processRepository: ProcessRepository,
    @Autowired private val decisionRepository: DecisionRepository,
    @Autowired private val decisionRequirementsRepository: DecisionRequirementsRepository
) {

    private val objectMapper = ObjectMapper().registerKotlinModule()

    private val process = Bpmn.createExecutableProcess("process")
        .startEvent()
        .endEvent()
        .done()

    private val processAsBytes = Bpmn.convertToString(process).toByteArray()

    private val decisionAsBytes = javaClass.getResourceAsStream("/rating.dmn")?.readAllBytes()!!

    @BeforeEach
    fun `clean database`() {
        processRepository.deleteAll()
        decisionRepository.deleteAll()
        decisionRequirementsRepository.deleteAll()
    }

    @Test
    fun `should deploy process without metadata (old API)`(testInfo: TestInfo) {
        // given
        val resourceName = "process_${testInfo.displayName}.bpmn"

        // when
        val response = mvc.perform(
            multipart("/rest/deployments/")
                .file(
                    MockMultipartFile(
                        "resources",
                        resourceName,
                        "application/bpmn",
                        processAsBytes
                    )
                )
        )
            .andExpect(status().isOk())
            .andReturn()
            .response
            .contentAsString;

        // then
        assertThat(response.toLong()).isPositive()

        await.untilAsserted {
            assertThat(processRepository.findAll())
                .hasSize(1)
                .extracting<String> { it.resourceName }
                .contains(resourceName)
        }
    }

    @Test
    fun `should deploy process`(testInfo: TestInfo) {
        // given
        val resourceName = "process_${testInfo.displayName}.bpmn"

        // when
        val deploymentResponse = deployProcess(resourceName)

        // then
        assertThat(deploymentResponse.deploymentKey).isPositive()
        assertThat(deploymentResponse.deployedProcesses)
            .hasSize(1)
            .extracting({ it.bpmnProcessId }, { it.resourceName }, { it.isDuplicate })
            .contains(tuple("process", resourceName, false))
        assertThat(deploymentResponse.deployedDecisions).isEmpty()

        await.untilAsserted {
            assertThat(processRepository.findAll())
                .hasSize(1)
                .extracting({ it.key }, { it.resourceName })
                .contains(
                    tuple(
                        deploymentResponse.deployedProcesses[0].processKey,
                        resourceName
                    )
                )
        }
    }

    @Test
    fun `should re-deploy process`(testInfo: TestInfo) {
        // given
        val resourceName = "process_${testInfo.displayName}.bpmn"

        deployProcess(resourceName)

        // when
        val deploymentResponse = deployProcess(resourceName)

        assertThat(deploymentResponse.deploymentKey).isPositive()
        assertThat(deploymentResponse.deployedProcesses)
            .hasSize(1)
            .extracting({ it.bpmnProcessId }, { it.resourceName }, { it.isDuplicate })
            .contains(tuple("process", resourceName, true))
        assertThat(deploymentResponse.deployedDecisions).isEmpty()
    }

    @Test
    fun `should deploy decision`(testInfo: TestInfo) {
        // given
        val resourceName = "rating_${testInfo.displayName}.dmn"

        // when
        val deploymentResponse = deployDecision(resourceName)

        // then
        assertThat(deploymentResponse.deploymentKey).isPositive()
        assertThat(deploymentResponse.deployedDecisions)
            .hasSize(2)
            .extracting({ it.decisionId }, { it.resourceName }, { it.isDuplicate })
            .contains(
                tuple("decision_a", resourceName, false),
                tuple("decision_b", resourceName, false)
            )
        assertThat(deploymentResponse.deployedProcesses).isEmpty()

        await.untilAsserted {
            assertThat(decisionRepository.findAll())
                .hasSize(2)
                .extracting({ it.key }, { it.decisionId })
                .containsAll(
                    deploymentResponse.deployedDecisions.map {
                        tuple(
                            it.decisionKey,
                            it.decisionId
                        )
                    }
                )
        }
    }

    @Test
    fun `should re-deploy decision`(testInfo: TestInfo) {
        // given
        val resourceName = "rating_${testInfo.displayName}.dmn"
        deployDecision(resourceName)

        // when
        val deploymentResponse = deployDecision(resourceName)

        // then
        assertThat(deploymentResponse.deploymentKey).isPositive()
        assertThat(deploymentResponse.deployedDecisions)
            .hasSize(2)
            .extracting({ it.decisionId }, { it.resourceName }, { it.isDuplicate })
            .contains(
                tuple("decision_a", resourceName, true),
                tuple("decision_b", resourceName, true)
            )
        assertThat(deploymentResponse.deployedProcesses).isEmpty()
    }

    private fun deployProcess(resourceName: String): DeploymentsResource.DeploymentResponse {
        return deploymentResource(
            MockMultipartFile(
                "resources",
                resourceName,
                "application/bpmn",
                processAsBytes
            )
        )
    }

    private fun deployDecision(resourceName: String): DeploymentsResource.DeploymentResponse {
        return deploymentResource(
            MockMultipartFile(
                "resources",
                resourceName,
                "application/dmn",
                decisionAsBytes
            )
        )
    }

    private fun deploymentResource(multipartFile: MockMultipartFile): DeploymentsResource.DeploymentResponse {
        val response = mvc.perform(
            multipart("/rest/deployments/deploy/")
                .file(multipartFile)
        )
            .andExpect(status().isOk())
            .andReturn()
            .response
            .contentAsString

        return objectMapper.readValue(response, DeploymentsResource.DeploymentResponse::class.java)
    }

}
