
function loadMonitoringView() {
  loadProcessInstancesView();
  loadIncidentsView();
}

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

//  ------------------------------------------------------------


const incidentsPerPage = 15;
let incidentsCurrentPage = 0;

function loadIncidentsView() {
  loadIncidents(0);
}

function loadIncidents(currentPage) {

  incidentsCurrentPage = currentPage;

  queryIncidents(incidentsPerPage, incidentsCurrentPage)
      .done(function (response) {
        let data = response.data;
        let incidents = data.incidents;
        let totalCount = incidents.totalCount;

        $("#incidents-total-count").text(totalCount);

        $("#incidents-created").text(data.createdIncidents.totalCount);
        $("#incidents-resolved").text(data.resolvedIncidents.totalCount);

        $("#incidents-table tbody").empty();

        const indexOffset = incidentsCurrentPage * incidentsPerPage + 1;

        incidents.nodes.forEach((incident, index) => {

          const state = formatIncidentState(incident.state);
          const processInstanceKey = incident.processInstance.key;
          const bpmnProcessId = incident.processInstance.process.bpmnProcessId;

          $("#incidents-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + incident.key + '</td>'
              + '<td><code>' + incident.errorType + '</code></td>'
              + '<td>' + incident.errorMessage + '</td>'
              + '<td>'
              + '<a href="/view/process-instance/' + processInstanceKey + '">' + processInstanceKey + '</a>'
              +'</td>'
              + '<td>' + bpmnProcessId +'</td>'
              + '<td>' + state +'</td>'
              + '</tr>');
        });

        updateIncidentsPagination(totalCount);
      });
}

function updateIncidentsPagination(totalCount) {
  updatePagination("incidents", incidentsPerPage, incidentsCurrentPage, totalCount);
}

function loadIncidentsFirst() {
  loadIncidents(0);
}

function loadIncidentsPrevious() {
  loadIncidents(incidentsCurrentPage - 1);
}

function loadIncidentsNext() {
  loadIncidents(incidentsCurrentPage + 1);
}
function loadIncidentsLast() {
  let last = $("#incidents-pagination-last").text() - 1;
  loadIncidents(last);
}
