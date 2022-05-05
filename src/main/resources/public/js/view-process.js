const instancesOfProcessPerPage = 5;
let instancesOfProcessCurrentPage = 0;

var bpmnViewIsLoaded = false;

function getProcessKey() {
  return $("#process-page-key").text();
}

function loadProcessView() {
  const processKey = getProcessKey();

  queryProcess(processKey)
      .done(function (response) {
        let process = response.data.process;
        $("#process-key").text(process.key);
        $("#bpmnProcessId").text(process.bpmnProcessId);
        $("#process-version").text(process.version);
        $("#process-deployment-time").text(process.deployTime);

        if (!bpmnViewIsLoaded) {
          const bpmnXML = process.bpmnXML;
          showBpmn(bpmnXML).then(ok => {
            makeStartEventsPlayable();
            makeMessageStartEventsPlayable();
            makeTimerStartEventsPlayable();
          });

          bpmnViewIsLoaded = true;
        }
      });

  loadInstancesOfProcess(instancesOfProcessCurrentPage);
  loadMessageSubscriptionsOfProcess();
  loadTimersOfProcess();
}

function loadInstancesOfProcess(currentPage) {

  const processKey = getProcessKey();
  instancesOfProcessCurrentPage = currentPage;

  queryInstancesByProcess(processKey, instancesOfProcessPerPage, instancesOfProcessCurrentPage)
      .done(function (response) {

        let process = response.data.process;
        $("#process-instances-active").text(process.activeInstances.totalCount);
        $("#process-instances-completed").text(process.completedInstances.totalCount);
        $("#process-instances-terminated").text(process.terminatedInstances.totalCount);

        let processInstances = process.processInstances;
        let totalCount = processInstances.totalCount;

        $("#process-instances-total-count").text(totalCount);

        $("#instances-of-process-table tbody").empty();

        const indexOffset = instancesOfProcessCurrentPage * instancesOfProcessPerPage + 1;

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

          $("#instances-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process-instance/' + node.key + '">' + node.key + '</a>'
              + '</td>'
              + '<td>' + node.startTime +'</td>'
              + '<td>' + endTime +'</td>'
              + '<td>' + state +'</td>'
              + '</tr>');
        });

        updateInstancesOfProcessPagination(totalCount);
      });
}

function updateInstancesOfProcessPagination(totalCount) {
  updatePagination("instances-of-process", instancesOfProcessPerPage, instancesOfProcessCurrentPage, totalCount);
}

function loadInstancesOfProcessFirst() {
  loadInstancesOfProcess(0);
}

function loadInstancesOfProcessPrevious() {
  loadInstancesOfProcess(instancesOfProcessCurrentPage - 1);
}

function loadInstancesOfProcessNext() {
  loadInstancesOfProcess(instancesOfProcessCurrentPage + 1);
}
function loadInstancesOfProcessLast() {
  let last = $("#instances-of-process-pagination-last").text() - 1;
  loadInstancesOfProcess(last);
}

function createNewProcessInstance() {
  const processKey = getProcessKey();
  createNewProcessInstanceWith(processKey, {});
}

function createNewProcessInstanceWithVariables() {
  const processKey = getProcessKey();
  const variables = $("#newInstanceVariables").val();

  let json = JSON.parse(variables);

  createNewProcessInstanceWith(processKey, json);
}

function createNewProcessInstanceWith(processKey, variables) {

  sendCreateInstanceRequest(processKey, variables)
      .done(processInstanceKey => {

        showNotificationNewInstanceCreated(processInstanceKey);

        loadInstancesOfProcess(instancesOfProcessCurrentPage);
      })
      .fail(showFailure(
          "create-instance-failed-" + processKey,
          "Failed to create process instance")
      );
}

function showNotificationNewInstanceCreated(processInstanceKey) {

  const toastId = "new-instance-" + processInstanceKey;
  const content = 'New process instance <a id="new-instance-toast-link" href="/view/process-instance/' + processInstanceKey + '">' + processInstanceKey + '</a> created.';

  showNotificationSuccess(toastId, content);
}

function loadMessageSubscriptionsOfProcess() {

  const processKey = getProcessKey();

  queryMessageSubscriptionsByProcess(processKey)
      .done(function (response) {

        let process = response.data.process;

        let messageSubscriptions = process.messageSubscriptions;
        let totalCount = messageSubscriptions.length;

        $("#message-subscriptions-total-count").text(totalCount);

        $("#message-subscriptions-of-process-table tbody").empty();

        const indexOffset = 1;

        messageSubscriptions.forEach((messageSubscription, index) => {

          let correlatedMessageCount = messageSubscription.messageCorrelations.length;

          let actionButton = '<div class="btn-group">'
              + '<button type="button" class="btn btn-sm btn-primary overlay-button" onclick="publishMessage(\'' + messageSubscription.messageName + '\');">'
              + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>'
              + ' Publish Message'
              + '</button>'
              + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
              + '<ul class="dropdown-menu">'
              + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#publish-message-modal" href="#" onclick="fillPublishMessageModal(\'' + messageSubscription.messageName  + '\');">with variables</a></li>'
              + '</ul>'
              + '</div>';

          $("#message-subscriptions-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + messageSubscription.key + '</td>'
              + '<td>' + messageSubscription.messageName +'</td>'
              + '<td>'
              + '<span class="badge bg-secondary">' + correlatedMessageCount + '</span>'
              + '</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');
        });
      });
}

function publishMessage(messageName) {

  sendPublishMessageRequestWithName(messageName)
      .done(messageKey => {
        showNotificationPublishMessageSuccess(messageKey);

        loadView();
      })
      .fail(showFailure(
          "publish-message-failed-" + messageName,
          "Failed to publish message")
      );
}

function showNotificationPublishMessageSuccess(messageKey) {
  const toastId = "message-published-" + messageKey;
  const content = 'New message <code>' + messageKey + '</code> published.';

  showNotificationSuccess(toastId, content);
}

function fillPublishMessageModal(messageName, correlationKey) {
  $("#publishMessageName").val(messageName);

  if (correlationKey) {
    $("#publishMessageCorrelationKey").val(correlationKey);
  }
}

function publishMessageModal() {
  sendPublishMessageRequest(
      $("#publishMessageName").val(),
      $("#publishMessageCorrelationKey").val(),
      $("#publishMessageVariables").val(),
      $("#publishMessageTimeToLive").val(),
      $("#publishMessageId").val()
  )
      .done(messageKey => {
        showNotificationPublishMessageSuccess(messageKey);

        loadView();
      })
      .fail(showFailure(
          "publish-message-failed",
          "Failed to publish message")
      );
}

function loadTimersOfProcess() {

  const processKey = getProcessKey();

  queryTimersByProcess(processKey)
      .done(function (response) {

        let process = response.data.process;

        let timers = process.timers;
        let totalCount = timers.length;

        $("#timers-total-count").text(totalCount);

        $("#timers-of-process-table tbody").empty();

        const indexOffset = 1;

        timers.forEach((timer, index) => {

          let actionButton = "";
          let state = "";
          switch (timer.state) {
            case "CREATED":
              state = '<span class="badge bg-primary">created</span>';

              actionButton = '<div class="btn-group">'
                  + '<button type="button" class="btn btn-sm btn-primary overlay-button" onclick="timeTravel(\'' + timer.dueDate + '\');">'
                  + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>'
                  + ' Time Travel'
                  + '</button>'
                  + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
                  + '<ul class="dropdown-menu">'
                  + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#time-travel-modal" href="#" onclick="fillTimeTravelModal(\'' + timer.dueDate  + '\');">with time</a></li>'
                  + '</ul>'
                  + '</div>';

              break;
            case "TRIGGERED":
              state = '<span class="badge bg-secondary">triggered</span>';
              break;
            default:
              state = "?"
          }

          let timerRepetitions = timer.repetitions;
          if (timerRepetitions < 0) {
            timerRepetitions = '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#infinity"/></svg>';
          }

          $("#timers-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + timer.key + '</td>'
              + '<td>' + timerRepetitions +'</td>'
              + '<td>' + timer.dueDate  + '</td>'
              + '<td>' + state +'</td>'
              + '<td>' + actionButton + '</td>'
              + '</tr>');
        });
      });
}

function timeTravel(timeDefinition) {

  let index = timeDefinition.indexOf("P");

  let successMessage;

  let request;
  if (index >= 0) {
    let duration = timeDefinition.substring(index);
    request = sendTimeTravelRequestWithDuration(duration);

    successMessage = 'Time travel by <code>' + duration + '</code>.';
  } else {
    let dateTime = timeDefinition;
    request = sendTimeTravelRequestWithDateTime(dateTime);

    successMessage = 'Time travel to <code>' + dateTime + '</code>.';
  }

  request
      .done(newTime => {
        const toastId = "time-travel-" + newTime;
        showNotificationSuccess(toastId, successMessage);

        loadInstancesOfProcess(instancesOfProcessCurrentPage);
        loadTimersOfProcess();
      })
      .fail(showFailure(
          "time-travel-failed",
          "Failed to time travel")
      );
}

function fillTimeTravelModal(timeDefinition) {
  let index = timeDefinition.indexOf("P");

  let timeDuration = $("#timeDuration");
  let timeDate = $("#timeDate");

  timeDuration.val("");
  timeDate.val("");

  if (index >= 0) {
    let duration = timeDefinition.substring(index);
    timeDuration.val(duration);
  } else {
    timeDate.val(timeDefinition);
  }
}

function timeTravelModal() {

  let timeDuration = $("#timeDuration").val();
  let timeDate = $("#timeDate").val();

  if (timeDuration && timeDuration.length > 0) {
    timeTravel(timeDuration);
  } else if (timeDate && timeDate.length > 0) {
    timeTravel(timeDate);
  }
}
