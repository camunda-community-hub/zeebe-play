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

        $("#nav-process").text(process.bpmnProcessId);

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

        processInstances.nodes.forEach((processInstance, index) => {

          const state = formatProcessInstanceState(processInstance);

          let endTime = "";
          if (processInstance.endTime) {
            endTime = processInstance.endTime;
          }

          $("#instances-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process-instance/' + processInstance.key + '">' + processInstance.key + '</a>'
              + '</td>'
              + '<td>' + processInstance.startTime +'</td>'
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

        const toastId = "new-instance-" + processInstanceKey;
        const content = 'New process instance <a id="new-instance-toast-link" href="/view/process-instance/' + processInstanceKey + '">' + processInstanceKey + '</a> created.';
        showNotificationSuccess(toastId, content);

        loadView();
      })
      .fail(showFailure(
          "create-instance-failed-" + processKey,
          "Failed to create process instance")
      );
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

          const fillModalAction = 'fillPublishMessageModal(\'' + messageSubscription.messageName  + '\');';
          let actionButton = '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#publish-message-modal" title="Publish message" onclick="'+ fillModalAction + '">'
              + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>'
              + ' Publish Message'
              + '</button>';

          $("#message-subscriptions-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + messageSubscription.key + '</td>'
              + '<td>' + messageSubscription.messageName +'</td>'
              + '<td>' + formatCorrelatedMessages(messageSubscription) + '</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');
        });
      });
}

function loadTimersOfProcess() {

  const processKey = getProcessKey();

  queryTimersByProcess(processKey)
      .done(function (response) {

        let process = response.data.process;

        let timers = process.timers;
        // TODO (saig0): fix filter in ZeeQS
        timers = timers.filter(function (timer) {
          // timer start events don't have an element instance
          return !timer.elementInstance;
        });

        let totalCount = timers.length;

        $("#timers-total-count").text(totalCount);

        $("#timers-of-process-table tbody").empty();

        const indexOffset = 1;

        timers.forEach((timer, index) => {

          const state = formatTimerState(timer.state);
          const isActiveTimer = timer.state === "CREATED";

          let actionButton = "";
          if (isActiveTimer) {
            const fillModalAction = 'fillTimeTravelModal(\'' + timer.dueDate  + '\');';
            actionButton = '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#time-travel-modal" title="Time travel" onclick="'+ fillModalAction + '">'
                + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>'
                + ' Time Travel'
                + '</button>';
          }

          $("#timers-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + timer.key + '</td>'
              + '<td>' + formatTimerRepetitions(timer) +'</td>'
              + '<td>' + timer.dueDate  + '</td>'
              + '<td>' + state +'</td>'
              + '<td>' + actionButton + '</td>'
              + '</tr>');
        });
      });
}
