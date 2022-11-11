
function loadMonitoringView() {
  loadProcessInstancesView();
  loadIncidentsView();
  loadMessagesView();
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

//  ------------------------------------------------------------

const messagesPerPage = 15;
let messagesCurrentPage = 0;

function loadMessagesView() {
  loadMessages(0);
}

function loadMessages(currentPage) {

  messagesCurrentPage = currentPage;

  queryMessages(messagesPerPage, messagesCurrentPage)
      .done(function (response) {
        let data = response.data;
        let messages = data.messages;
        let totalCount = messages.totalCount;

        $("#messages-total-count").text(totalCount);

        $("#messages-published").text(data.publishedMessages.totalCount);
        $("#messages-expired").text(data.expiredMessages.totalCount);

        $("#messages-table tbody").empty();

        const indexOffset = messagesCurrentPage * messagesPerPage + 1;

        messages.nodes.forEach((message, index) => {

          const state = formatMessageState(message.state);

          const fillModalAction = 'fillMessageDetailsModal(' + message.key + ');';
          const actionButton = '<button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="modal" data-bs-target="#message-detail-modal" title="Show message details" onclick="'
              + fillModalAction + '">'
              + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>'
              + '</button>';

          const correlatedInstances = formatMessageCorrelations(message);

          $("#messages-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + message.key + '</td>'
              + '<td>' + message.name + '</td>'
              + '<td><code>' + message.correlationKey + '</code></td>'
              + '<td>' + actionButton + '</td>'
              + '<td>' + correlatedInstances + '</td>'
              + '<td>' + state +'</td>'
              + '</tr>');
        });

        updateMessagesPagination(totalCount);
      });
}

function formatMessageCorrelations(message) {
  const correlatedInstancesCount = message.messageCorrelations.length;
  const messageCollapseId = "message-" + message.key;
  let correlatedMessagesFormatted = '<div class="row row-cols-1">'
      + '<div class="col">'
      + '<span class="badge bg-secondary">' + correlatedInstancesCount + '</span>'
      + ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#'
      + messageCollapseId
      + '" aria-expanded="false" title="Show correlated instances">'
      + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>'
      + '</button>'
      + '</div>'

  let correlatedMessages = '<table class="table">'
      + '<thead>'
      + '<tr>'
      + '<th scope="col">Process Instance Key</th>'
      + '<th scope="col">BPMN Process Id</th>'
      + '<th scope="col">Correlation Time</th>'
      + '<th></th>'
      + '</tr>'
      + '</thead>'
      + '<tbody>';

  message.messageCorrelations.forEach((messageCorrelation) => {

    const messageSubscription = messageCorrelation.messageSubscription;
    const processInstance = messageCorrelation.processInstance;
    const process = processInstance.process;
    const bpmnProcessId = process.bpmnProcessId;

    const processInstanceKey = '<a href="/view/process-instance/' + processInstance.key + '">' + processInstance.key + '</a>';

    correlatedMessages += '<tr>'
        + '<td>' + processInstanceKey + '</td>'
        + '<td>' + bpmnProcessId + '</td>'
        + '<td>' + messageCorrelation.timestamp + '</td>'
        + '</tr>';
  });

  correlatedMessages += '</tbody></table>';
  correlatedMessagesFormatted += '<div class="collapse" id="'
      + messageCollapseId + '">'
      + '<div class="col">'
      + correlatedMessages
      + '</div>'
      + '</div>'
      + '</div>';
  return correlatedMessagesFormatted;
}

function updateMessagesPagination(totalCount) {
  updatePagination("messages", messagesPerPage, messagesCurrentPage, totalCount);
}

function loadMessagesFirst() {
  loadMessages(0);
}

function loadMessagesPrevious() {
  loadMessages(messagesCurrentPage - 1);
}

function loadMessagesNext() {
  loadMessages(messagesCurrentPage + 1);
}
function loadMessagesLast() {
  let last = $("#messages-pagination-last").text() - 1;
  loadMessages(last);
}