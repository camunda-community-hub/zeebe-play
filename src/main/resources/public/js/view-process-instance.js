var bpmnViewIsLoaded = false;
var markedBpmnElement;

function getProcessInstanceKey() {
  return $("#process-instance-page-key").text();
}

function isProcessInstanceActive(processInstance) {
  switch (processInstance.state) {
    case "ACTIVATED":
      return true;
    default:
      return false;
  }
}

function loadProcessInstanceView() {
  const processInstanceKey = getProcessInstanceKey();

  queryProcessInstance(processInstanceKey)
      .done(function (response) {
        let processInstance = response.data.processInstance;
        let process = processInstance.process;

        $("#process-instance-key").text(processInstance.key);
        $("#process-instance-start-time").text(processInstance.startTime);

        let endTime = "-";
        if (processInstance.endTime) {
          endTime = processInstance.endTime;
        }

        $("#process-instance-end-time").text(endTime);

        let state = formatProcessInstanceState(processInstance);

        $("#process-instance-state").html(state);

        $("#process-page-key").html(
            '<a href="/view/process/' + process.key + '">'
            + process.bpmnProcessId
            + '</a>'
        );

        if (!isProcessInstanceActive(processInstance)) {
          disableProcessInstanceActionButtons();
        }

        if (!bpmnViewIsLoaded) {
          const bpmnXML = process.bpmnXML;
          showBpmn(bpmnXML).then(function (r) {
            // wait until BPMN is loaded
            loadProcessInstanceDetailsViews();
          });

          bpmnViewIsLoaded = true;
        }
      });

  if (bpmnViewIsLoaded) {
    loadProcessInstanceDetailsViews();
  }
}

function loadProcessInstanceDetailsViews() {
  loadVariablesOfProcessInstance();
  loadParentInstanceOfProcessInstance();

  loadElementInstancesOfProcessInstance();
  loadJobsOfProcessInstance();
  loadIncidentsOfProcessInstance();
  loadMessageSubscriptionsOfProcessInstance();
  loadTimersOfProcessInstance();
  loadChildInstancesOfProcessInstance();
}

function disableProcessInstanceActionButtons() {
  $("#process-instance-set-variables").addClass("disabled");
  $("#process-instance-cancel").addClass("disabled");
  $("#process-instance-publish-message").addClass("disabled");
  $("#process-instance-time-travel").addClass("disabled");
}

function loadVariablesOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryVariablesByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let variables = processInstance.variables;

        let totalCount = variables.length;
        $("#variables-total-count").text(totalCount);

        $("#variables-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        variables.forEach((variable, index) => {

          let scope = variable.scope;

          let scopeFormatted;
          if (scope.bpmnElementType === 'PROCESS') {
            scopeFormatted = '<span class="badge bg-primary">global</span>';
          } else {
            scopeFormatted = '<span class="badge bg-secondary">local</span>';
          }

          let scopeElement = formatBpmnElementInstance(scope.element);

          let valueFormatted = '<code>' + variable.value + '</code>';

          let lastUpdatedFormatted = '<div class="row row-cols-1">'
              + '<div class="col">'
              + variable.timestamp;

          let variableUpdatesId = 'variable-updates-' + variable.key;

          if (variable.updates.length > 1) {
            lastUpdatedFormatted += ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#' + variableUpdatesId + '" aria-expanded="false" title="Show updates">'
                + '<span class="badge bg-secondary">modified</span>'
                + '</button>';
          }

          lastUpdatedFormatted += "</div>"

          if (variable.updates.length > 1) {

            let variableUpdates = '<table class="table">'
                + '<thead>'
                + '<tr>'
                + '<th scope="col">Value</th>'
                + '<th scope="col">Update Time</th>'
                + '</tr>'
                + '</thead>'
                + '<tbody>';

            variable.updates.forEach((update) => {
              variableUpdates += '<tr>'
                  + '<td><code>' + update.value + '</code></td>'
                  + '<td>' + update.timestamp +'</td>'
                  + '</tr>';
            });

            variableUpdates += '</tbody></table>';

            lastUpdatedFormatted += '<div class="collapse" id="' + variableUpdatesId + '">'
                + '<div class="col">'
                + variableUpdates
                + '</div>'
                + '</div>';
          }

          lastUpdatedFormatted += '</div>';

          let actionButton = '';
          if (isProcessInstanceActive(processInstance)) {
            let fillModalAction = 'fillSetVariablesModal(\''
                + scope.key + '\', \''
                + variable.name + '\', \''
                + variable.value.replace(/"/g, '&quot;')
                + '\');';

            actionButton = '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#set-variable-modal" title="Edit" onclick="'
                + fillModalAction + '">'
                + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#pencil"/></svg>'
                + ' Edit'
                + '</button>';
          }

          $("#variables-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + variable.name + '</td>'
              + '<td>' + valueFormatted +'</td>'
              + '<td>' + scopeFormatted +'</td>'
              + '<td>' + scopeElement +'</td>'
              + '<td>' + scope.key +'</td>'
              + '<td>' + lastUpdatedFormatted +'</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');

        });

      });
}

function fillSetVariablesModal(scopeKey, variableName, variableValue) {
  let scope = scopeKey;
  if (scopeKey === getProcessInstanceKey()) {
    scope = 'global';
  }
  $("#variablesScope").val(scope);

  let variables = '{"' + variableName + '": ' + variableValue + '}';
  $("#updatedVariables").val(variables);
}

function setVariablesModal() {
  let scope = $("#variablesScope").val();
  if (scope === 'global') {
    scope = getProcessInstanceKey();
  }

  let variables = $("#updatedVariables").val();

  sendSetVariablesRequest(getProcessInstanceKey(), scope, variables)
      .done(key => {
        const toastId = "set-variables-" + key;
        showNotificationSuccess(toastId, "Set variables <code>" + variables + "</code>.");

        loadVariablesOfProcessInstance();
      })
      .fail(showFailure(
          "set-variables" + scope,
          "Failed to set variables <code>" + variables + "</code>.")
      );
}

function cancelProcessInstance() {

  let processInstanceKey = getProcessInstanceKey();
  sendCancelProcessInstanceRequest(processInstanceKey)
      .done(key => {
        const toastId = "cancel-process-instance-" + processInstanceKey;
        showNotificationSuccess(toastId, "Cancelled process instance.");

        loadProcessInstanceView();
      })
      .fail(showFailure(
          "cancel-process-instance-" + processInstanceKey,
          "Failed to cancel process instance.")
      );
}

function loadElementInstancesOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryElementInstancesByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let elementInstances = processInstance.elementInstances;

        let totalCount = elementInstances.length;

        $("#element-instances-total-count").text(totalCount);

        $("#element-instances-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        elementInstances.forEach((elementInstance, index) => {

          let elementFormatted = formatBpmnElementInstance(elementInstance.element);

          let scopeFormatted = '';
          if (elementInstance.scope) {
            scopeFormatted = elementInstance.scope.key;
          }

          let endTime = '';
          if (elementInstance.endTime) {
            endTime = elementInstance.endTime;
          }

          let stateTransitionsId = "state-transitions-" + elementInstance.key;

          let stateFormatted = '<div class="row row-cols-1">'
              + '<div class="col">'
              + ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#' + stateTransitionsId + '" aria-expanded="false" title="Show state transitions">'
              + formatElementInstanceState(elementInstance.state)
              + '</button>'
              + '</div>'

            let stateTransitions = '<table class="table">'
                + '<thead>'
                + '<tr>'
                + '<th scope="col">State</th>'
                + '<th scope="col">Timestamp</th>'
                + '</tr>'
                + '</thead>'
                + '<tbody>';

          elementInstance.stateTransitions.forEach((stateTransition) => {
            stateTransitions += '<tr>'
                  + '<td>' + formatElementInstanceState(stateTransition.state) + '</td>'
                  + '<td>' + stateTransition.timestamp +'</td>'
                  + '</tr>';
            });

          stateTransitions += '</tbody></table>';
          stateFormatted += '<div class="collapse" id="' + stateTransitionsId + '">'
              + '<div class="col">'
              + stateTransitions
              + '</div>'
              + '</div>'
              + '</div>';

          $("#element-instances-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + elementFormatted +'</td>'
              + '<td>' + elementInstance.key + '</td>'
              + '<td>' + scopeFormatted +'</td>'
              + '<td>' + stateFormatted +'</td>'
              + '<td>' + elementInstance.startTime +'</td>'
              + '<td>' + endTime +'</td>'
              + '</tr>');

        });

        markElementInstances(processInstance);
      });
}

function markElementInstances(processInstance) {

  processInstance.elementInstances.forEach((elementInstance) => {
    removeBpmnElementMarkers(elementInstance.element.elementId);
  });

  processInstance.activeElementInstances.forEach((elementInstance) => {
    let bpmnElement = elementInstance.element;
    if (bpmnElement.bpmnElementType !== 'PROCESS') {
      markBpmnElementAsActive(bpmnElement.elementId);
    }
  });

  processInstance.takenSequenceFlows.forEach((sequenceFlow) => {
    markSequenceFlow(sequenceFlow.element.elementId);
  });

  processInstance.elementInstancesWithIncidents.forEach((incidents) => {
    let elementId = incidents.elementInstance.element.elementId;
    markBpmnElementWithIncident(elementId);
  });

  addElementCounters(processInstance);
}

function addElementCounters(processInstance) {
  let elementCounters = {};

  processInstance.activeElementInstances.forEach((elementInstance) => {
    updateElementCounter(elementCounters, elementInstance.element, function (counter) {
      counter.active += 1;
    })
  });

  processInstance.completedElementInstances.forEach((elementInstance) => {
    updateElementCounter(elementCounters, elementInstance.element, function (counter) {
      counter.completed += 1;
    })
  });

  processInstance.terminatedElementInstances.forEach((elementInstance) => {
    updateElementCounter(elementCounters, elementInstance.element, function (counter) {
      counter.terminated += 1;
    })
  });

  onBpmnElementHover(function (elementId) {
    let counter = elementCounters[elementId];
    if (counter) {
      showElementCounters(elementId, counter.active, counter.completed, counter.terminated);
    }
  });

  onBpmnElementOut(function (elementId) {
    if (elementId === markedBpmnElement) {
      return;
    }

    let counter = elementCounters[elementId];
    if (counter) {
      removeElementCounters(elementId);
    }
  });

  onBpmnElementClick(function (elementId) {
    if (markedBpmnElement) {
      removeElementCounters(markedBpmnElement);
    }

    if (elementId === markedBpmnElement) {
      markedBpmnElement = undefined;
      return;
    }
    markedBpmnElement = elementId;

    let counter = elementCounters[elementId];
    if (counter) {
      showElementCounters(elementId, counter.active, counter.completed, counter.terminated);
    }
  });
}

function updateElementCounter(elementCounters, bpmnElement, updateCounter) {
  if (bpmnElement.bpmnElementType === 'PROCESS') {
    return
  }
  let elementId = bpmnElement.elementId;
  let counter = elementCounters[elementId];
  if (!counter) {
    counter = {active: 0, completed: 0, terminated: 0};
  }
  updateCounter(counter);
  elementCounters[elementId] = counter;
}

function loadJobsOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryJobsByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let jobs = processInstance.jobs;

        let totalCount = jobs.length;

        $("#jobs-total-count").text(totalCount);

        $("#jobs-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        jobs.forEach((job, index) => {

          const bpmnElement = job.elementInstance.element;
          let elementFormatted = formatBpmnElementInstance(bpmnElement);

          const elementId = bpmnElement.elementId;

          let state = formatJobState(job.state);
          const isActiveJob = job.state === "ACTIVATABLE";

          let actionButton = '';
          if (isActiveJob) {
            let fillModalAction = function (type) {
              return 'fillJobModal(\'' + job.key + '\', \'' + type + '\');';
            }

            actionButton = '<div class="btn-group">'
                + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="modal" data-bs-target="#complete-job-modal" onclick="'
                + fillModalAction('complete') + '">'
                + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>'
                + ' Complete'
                + '</button>'
                + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
                + '<ul class="dropdown-menu">'
                + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#fail-job-modal" href="#" onclick="'
                + fillModalAction('fail') + '">'
                + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>'
                + ' Fail' + '</a></li>'
                + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#throw-error-job-modal" href="#" onclick="'
                + fillModalAction('throw-error') + '">'
                + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#lightning"/></svg>'
                + ' Throw Error' + '</a></li>'
                + '</ul>'
                + '</div>';
          }

          $("#jobs-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + job.key +'</td>'
              + '<td>' + job.jobType +'</td>'
              + '<td>' + elementFormatted +'</td>'
              + '<td>' + job.elementInstance.key +'</td>'
              + '<td>' + state + '</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');

          if (isActiveJob) {
            makeTaskPlayable(elementId, job.key);
          } else {
            removeTaskPlayableMarker(elementId);
          }
        });
      });
}

function loadIncidentsOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryIncidentsByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let incidents = processInstance.incidents;

        let totalCount = incidents.length;

        $("#incidents-total-count").text(totalCount);

        $("#incidents-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        incidents.forEach((incident, index) => {

          const bpmnElement = incident.elementInstance.element;
          let elementFormatted = formatBpmnElementInstance(bpmnElement);
          const elementId = bpmnElement.elementId;

          let state = formatIncidentState(incident.state);
          const isActiveIncident = incident.state === "CREATED";

          let jobKey = '';
          if (incident.job) {
            jobKey = incident.job.key;
          }

          const action = 'resolveIncident(' + incident.key + ', ' + jobKey + ');'

          let actionButton = '';
          if (isActiveIncident) {
            actionButton = '<button type="button" class="btn btn-sm btn-primary" title="Resolve" onclick="'+ action + '">'
                + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#arrow-counterclockwise"/></svg>'
                + ' Resolve'
                + '</button>';
          }

          $("#incidents-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + incident.key +'</td>'
              + '<td><code>' + incident.errorType +'</code></td>'
              + '<td>' + incident.errorMessage +'</td>'
              + '<td>' + elementFormatted +'</td>'
              + '<td>' + incident.elementInstance.key +'</td>'
              + '<td>' + state + '</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');

          if (isActiveIncident) {
            addResolveIncidentButton(elementId, action);
          } else {
            removeResolveIncidentButton(elementId);
          }
        });
      });
}

function formatCorrelatedMessages(messageSubscription) {
  const correlatedMessageCount = messageSubscription.messageCorrelations.length;
  const messageSubscriptionCollapseId = "message-subscription-"
      + messageSubscription.key;
  let correlatedMessagesFormatted = '<div class="row row-cols-1">'
      + '<div class="col">'
      + ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#'
      + messageSubscriptionCollapseId
      + '" aria-expanded="false" title="Show correlated messages">'
      + ' <span class="badge bg-secondary">' + correlatedMessageCount
      + '</span>'
      + '</button>'
      + '</div>'

  let correlatedMessages = '<table class="table">'
      + '<thead>'
      + '<tr>'
      + '<th scope="col">Message Key</th>'
      + '<th scope="col">Correlation Time</th>'
      + '<th></th>'
      + '</tr>'
      + '</thead>'
      + '<tbody>';

  messageSubscription.messageCorrelations.forEach((messageCorrelation) => {
    const message = messageCorrelation.message;

    const fillModalAction = 'fillMessageDetailsModal(' + message.key + ');';
    const actionButton = '<button type="button" class="btn btn-sm" data-bs-toggle="modal" data-bs-target="#message-detail-modal" title="Message details" onclick="'
        + fillModalAction + '">'
        + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>'
        + '</button>';

    correlatedMessages += '<tr>'
        + '<td>' + message.key + '</td>'
        + '<td>' + messageCorrelation.timestamp + '</td>'
        + '<td>' + actionButton + '</td>'
        + '</tr>';
  });

  correlatedMessages += '</tbody></table>';
  correlatedMessagesFormatted += '<div class="collapse" id="'
      + messageSubscriptionCollapseId + '">'
      + '<div class="col">'
      + correlatedMessages
      + '</div>'
      + '</div>'
      + '</div>';
  return correlatedMessagesFormatted;
}

function loadMessageSubscriptionsOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryMessageSubscriptionsByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let messageSubscriptions = processInstance.messageSubscriptions;

        let totalCount = messageSubscriptions.length;

        $("#message-subscriptions-total-count").text(totalCount);

        $("#message-subscriptions-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        messageSubscriptions.forEach((messageSubscription, index) => {

          let bpmnElement = messageSubscription.elementInstance.element;
          let elementFormatted = formatBpmnElementInstance(bpmnElement);
          const elementId = bpmnElement.elementId;

          let state = formatMessageSubscriptionState(messageSubscription.state);

          const isActiveMessageSubscription = messageSubscription.state === "CREATED" || (
              messageSubscription.state === "CORRELATED" && messageSubscription.elementInstance.state === 'ACTIVATED');

          const fillModalAction = 'fillPublishMessageModal(\'' + messageSubscription.messageName + '\', \'' + messageSubscription.messageCorrelationKey + '\');';

          let actionButton = '';
          if (isActiveMessageSubscription) {
            actionButton = '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#publish-message-modal" title="Publish message" onclick="'+ fillModalAction + '">'
                + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>'
                + ' Publish Message'
                + '</button>';
          }

          $("#message-subscriptions-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + messageSubscription.key +'</td>'
              + '<td>' + messageSubscription.messageName +'</td>'
              + '<td><code>' + messageSubscription.messageCorrelationKey +'</code></td>'
              + '<td>' + elementFormatted +'</td>'
              + '<td>' + messageSubscription.elementInstance.key +'</td>'
              + '<td>' + state + '</td>'
              + '<td>' + formatCorrelatedMessages(messageSubscription) + '</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');

          if (isActiveMessageSubscription) {
            const clickAction = 'publishMessage(\'' + messageSubscription.messageName + '\', \'' + messageSubscription.messageCorrelationKey + '\');';
            addPublishMessageButton(elementId, clickAction, fillModalAction);
          } else {
            removePublishMessageButton(elementId);
          }
        });
      });
}

function loadTimersOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryTimersByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let timers = processInstance.timers;

        let totalCount = timers.length;

        $("#timers-total-count").text(totalCount);

        $("#timers-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        timers.forEach((timer, index) => {

          const bpmnElement = timer.element;
          let elementFormatted = formatBpmnElementInstance(bpmnElement);

          let state = formatTimerState(timer.state);
          const isActiveTimer = timer.state === "CREATED";

          const action = 'timeTravel(\'' + timer.dueDate + '\');';
          const fillModalAction = 'fillTimeTravelModal(\'' + timer.dueDate  + '\');';

          let actionButton = '';
          if (isActiveTimer) {
            actionButton = '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#time-travel-modal" title="Time travel" onclick="'+ fillModalAction + '">'
                + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>'
                + ' Time Travel'
                + '</button>';
          }

          $("#timers-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + timer.key +'</td>'
              + '<td>' + formatTimerRepetitions(timer) +'</td>'
              + '<td>' + timer.dueDate +'</td>'
              + '<td>' + elementFormatted +'</td>'
              + '<td>' + timer.elementInstance.key +'</td>'
              + '<td>' + state + '</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');

          const elementId = bpmnElement.elementId;

          if (isActiveTimer) {
            addTimeTravelButton(elementId, action, fillModalAction);
          } else {
            removeTimeTravelButton(elementId);
          }
        });

      });
}

function loadChildInstancesOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryChildInstancesByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let childProcessInstances = processInstance.childProcessInstances;

        let totalCount = childProcessInstances.length;

        $("#child-instances-total-count").text(totalCount);

        $("#child-instances-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        childProcessInstances.forEach((childInstance, index) => {

          const parentBpmnElement = childInstance.parentElementInstance.element;
          const elementFormatted = formatBpmnElementInstance(parentBpmnElement);
          const state = formatProcessInstanceState(childInstance)
          const hrefChildInstance= '/view/process-instance/' + childInstance.key;
          const childInstanceKeyFormatted = '<a href="' + hrefChildInstance + '">' + childInstance.key + '</a>';
          const childBpmnProcessId = childInstance.process.bpmnProcessId;

          $("#child-instances-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + childInstanceKeyFormatted +'</td>'
              + '<td>' + childBpmnProcessId +'</td>'
              + '<td>' + elementFormatted +'</td>'
              + '<td>' + childInstance.parentElementInstance.key +'</td>'
              + '<td>' + state + '</td>'
              + '</tr>');

          const elementId = parentBpmnElement.elementId;
          addOpenChildInstanceButton(elementId, hrefChildInstance);
        });

      });
}

function loadParentInstanceOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryParentInstanceByProcessInstance(processInstanceKey)
      .done(function (response) {

        const processInstance = response.data.processInstance;
        appendParentProcessInstanceToNav(processInstance);
      });
}

function appendParentProcessInstanceToNav(processInstance) {
  const parentElementInstance = processInstance.parentElementInstance;

  if (parentElementInstance) {

    const parentProcessInstance = parentElementInstance.processInstance;
    const parentProcessInstanceKey = parentProcessInstance.key;
    const parentBpmnProcessId = parentProcessInstance.process.bpmnProcessId;

    $("#process-instance-breadcrumb > ol:last-child").append(
        '<li class="breadcrumb-item" aria-current="page">'
        + '<a href="/view/process-instance/' + parentProcessInstanceKey
        + '">' + parentProcessInstanceKey + '</a>'
        + ' <span class="text-muted">(' + parentBpmnProcessId + ')</span>'
        + '</li>');

    appendParentProcessInstanceToNav(parentProcessInstance);
  }
}