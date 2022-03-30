const processInstancesPerPage = 15;
let processInstancesCurrentPage = 0;

function loadProcessInstancesView() {
  loadProcessInstances(0);
}

function loadProcessInstances(currentPage) {

  processInstancesCurrentPage = currentPage;

  queryProcessInstances(processInstancesPerPage, processInstancesCurrentPage)
      .done(function (response) {
        let data = response.data;
        let processInstances = data.processInstances;
        let totalCount = processInstances.totalCount;

        $("#process-instances-total-count").text(totalCount);

        $("#process-instances-active").text(data.activeProcessInstances.totalCount);
        $("#process-instances-completed").text(data.completedProcessInstances.totalCount);
        $("#process-instances-terminated").text(data.terminatedProcessInstances.totalCount);

        $("#process-instances-table tbody").empty();

        const indexOffset = processInstancesCurrentPage * processInstancesPerPage + 1;

        processInstances.nodes.forEach((node, index) => {

          let state = "";
          switch (node.state) {
            case "ACTIVATED":
              state = '<span class="badge bg-primary">active</span>';
              break;
            case "COMPLETED":
              state = '<span class="badge bg-secondary">completed</span>';
              break;
            case "TERMINATED":
              state = '<span class="badge bg-dark">terminated</span>';
              break;
            default:
              state = "?"
          }

          if (node.incidents.length > 0) {
            state += ' <span class="badge bg-danger">incidents</span>';
          }

          let endTime = "";
          if (node.endTime) {
            endTime = node.endTime;
          }

          $("#process-instances-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process-instance/' + node.key + '">' + node.key + '</a>'
              + '</td>'
              + '<td>' + node.process.bpmnProcessId +'</td>'
              + '<td>' + node.process.version +'</td>'
              + '<td>'
              + '<a href="/view/process/' + node.process.key + '">' + node.process.key + '</a>'
              +'</td>'
              + '<td>' + node.startTime +'</td>'
              + '<td>' + endTime +'</td>'
              + '<td>' + state +'</td>'
              + '</tr>');
        });

        updateProcessInstancesPagination(totalCount);
      });
}

function updateProcessInstancesPagination(totalCount) {
  updatePagination("process-instances", processInstancesPerPage, processInstancesCurrentPage, totalCount);
}

function loadProcessInstancesFirst() {
  loadProcessInstances(0);
}

function loadProcessInstancesPrevious() {
  loadProcessInstances(processInstancesCurrentPage - 1);
}

function loadProcessInstancesNext() {
  loadProcessInstances(processInstancesCurrentPage + 1);
}
function loadProcessInstancesLast() {
  let last = $("#process-instances-pagination-last").text() - 1;
  loadProcessInstances(last);
}

