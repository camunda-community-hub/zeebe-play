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

        processInstances.nodes.forEach((processInstance, index) => {

          const state = formatProcessInstanceState(processInstance)

          let endTime = "";
          if (processInstance.endTime) {
            endTime = processInstance.endTime;
          }

          $("#process-instances-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process-instance/' + processInstance.key + '">' + processInstance.key + '</a>'
              + '</td>'
              + '<td>' + processInstance.process.bpmnProcessId +'</td>'
              + '<td>' + processInstance.process.version +'</td>'
              + '<td>'
              + '<a href="/view/process/' + processInstance.process.key + '">' + processInstance.process.key + '</a>'
              +'</td>'
              + '<td>' + processInstance.startTime +'</td>'
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

