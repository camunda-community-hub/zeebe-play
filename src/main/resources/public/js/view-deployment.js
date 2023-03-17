const processesPerPage = 20;
let processesCurrentPage = 0;

const decisionsPerPage = 20;
let decisionsCurrentPage = 0;

let deploymentSubscriptionsOpened = false;

function loadDeploymentView() {
  loadProcesses(0);
  loadDecisions(0);

  if (!deploymentSubscriptionsOpened) {
    deploymentSubscriptionsOpened = true;
    // reload to show the new process
    subscribeToProcessUpdates(() => loadDeploymentView());
    // reload to update the process instance count
    subscribeToProcessInstanceUpdates(
      "updateTypeIn",
      "[PROCESS_INSTANCE_STATE]",
      () => loadDeploymentView()
    );
    // reload to show the new decision
    subscribeToDecisionUpdates(() => loadDeploymentView());
    // reload to update the decision evaluation count
    subscribeToDecisionEvaluationUpdates(() => loadDeploymentView());
  }
}

function loadProcesses(currentPage) {
  processesCurrentPage = currentPage;

  queryProcesses(processesPerPage, processesCurrentPage).done(function (
    response
  ) {
    let processes = response.data.processes;
    let totalCount = processes.totalCount;

    $("#processes-totalCount").text(totalCount);

    $("#processes-table tbody").empty();

    const indexOffset = processesCurrentPage * processesPerPage + 1;

    processes.nodes.forEach((node, index) => {
      $("#processes-table tbody:last-child").append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          '<a href="/view/process/' +
          node.key +
          '">' +
          node.key +
          "</a>" +
          "</td>" +
          "<td>" +
          node.bpmnProcessId +
          "</td>" +
          "<td>" +
          node.version +
          "</td>" +
          "<td>" +
          node.deployTime +
          "</td>" +
          "<td>" +
          '<span class="badge bg-primary">' +
          node.activeInstances.totalCount +
          "</span> / " +
          '<span class="badge bg-secondary">' +
          node.completedInstances.totalCount +
          "</span> / " +
          '<span class="badge bg-dark">' +
          node.terminatedInstances.totalCount +
          "</span>" +
          "</td>" +
          "</tr>"
      );
    });

    updateProcessesPagination(totalCount);
  });
}

function updateProcessesPagination(totalCount) {
  updatePagination(
    "processes",
    processesPerPage,
    processesCurrentPage,
    totalCount
  );
}

function loadProcessesFirst() {
  loadProcesses(0);
}

function loadProcessesPrevious() {
  loadProcesses(processesCurrentPage - 1);
}

function loadProcessesNext() {
  loadProcesses(processesCurrentPage + 1);
}

function loadProcessesLast() {
  let last = $("#processes-pagination-last").text() - 1;
  loadProcesses(last);
}

function deploymentModal() {
  let resources = $("#deploymentForm")[0];

  deployResources(resources)
    .done(function (deploymentKey) {
      const toastId = "new-deployment-" + deploymentKey;
      const content = "New resources deployed";
      showNotificationSuccess(toastId, content);

      loadDeploymentView();
    })
    .fail(showFailure("deployment-failed", "Failed to deploy resources"));
}

function loadDecisions(currentPage) {
  decisionsCurrentPage = currentPage;

  queryDecisions(decisionsPerPage, decisionsCurrentPage).done(function (
    response
  ) {
    let decisions = response.data.decisions;
    let totalCount = decisions.totalCount;

    $("#decisions-totalCount").text(totalCount);

    $("#decisions-table tbody").empty();

    const indexOffset = decisionsCurrentPage * decisionsPerPage + 1;

    decisions.nodes.forEach((decision, index) => {
      $("#decisions-table tbody:last-child").append(`
        <tr>
          <td>${indexOffset + index}</td>
          <td>
            <a href="/view/decision/${decision.key}">${decision.key}</a>
          </td>
          <td>${decision.decisionName}</td>
          <td>${decision.decisionRequirements?.decisionRequirementsName}</td>
          <td>${decision.version}</td>
          <td>${decision.decisionRequirements?.deployTime}</td>
          <td>
            <span class="badge bg-secondary">
               ${decision.successfulEvaluations.totalCount}
              </span> / 
              <span class="badge bg-dark">
                ${decision.failedEvaluations.totalCount}
              </span> 
          </td>
        </tr>`);
    });

    updateDecisionsPagination(totalCount);
  });
}

function updateDecisionsPagination(totalCount) {
  updatePagination(
    "decisions",
    decisionsPerPage,
    decisionsCurrentPage,
    totalCount
  );
}

function loadDecisionsFirst() {
  loadDecisions(0);
}

function loadDecisionsPrevious() {
  loadDecisions(decisionsCurrentPage - 1);
}

function loadDecisionsNext() {
  loadDecisions(decisionsCurrentPage + 1);
}

function loadDecisionsLast() {
  let last = $("#decisions-pagination-last").text() - 1;
  loadDecisions(last);
}
