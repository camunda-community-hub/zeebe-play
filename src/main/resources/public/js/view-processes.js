const processesPerPage = 20;
let processesCurrentPage = 0;

function loadProcessesView() {
  loadProcesses(0);
}

function loadProcesses(currentPage) {

  processesCurrentPage = currentPage;

  queryProcesses(processesPerPage, processesCurrentPage)
      .done(function (response) {
        let processes = response.data.processes;
        let totalCount = processes.totalCount;

        $("#processes-totalCount").text(totalCount);

        $("#processes-table tbody").empty();

        const indexOffset = processesCurrentPage * processesPerPage + 1;

        processes.nodes.forEach((node, index) => {
          $("#processes-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process/' + node.key + '">' + node.key + '</a>'
              + '</td>'
              + '<td>' + node.bpmnProcessId +'</td>'
              + '<td>' + node.version +'</td>'
              + '<td>' + node.deployTime +'</td>'
              + '<td>'
              + '<span class="badge bg-primary">' + node.activeInstances.totalCount + '</span> / '
              + '<span class="badge bg-secondary">' + node.completedInstances.totalCount + '</span> / '
              + '<span class="badge bg-dark">' + node.terminatedInstances.totalCount + '</span>'
              +'</td>'
              + '</tr>');
        });

        updateProcessesPagination(totalCount);
      });
}

function updateProcessesPagination(totalCount) {
  updatePagination("processes", processesPerPage, processesCurrentPage, totalCount);
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
      .done(function(deploymentKey) {

        const toastId = "new-deployment-" + deploymentKey;
        const content = 'New resources deployed.';
        showNotificationSuccess(toastId, content);

        loadProcesses(processesCurrentPage);
      })
      .fail(showFailure(
          "deployment-failed",
          "Failed to deploy resources")
      );
}
