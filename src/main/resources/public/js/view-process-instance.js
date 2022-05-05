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

        let state = "";
        switch (processInstance.state) {
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

        if (processInstance.incidents.length > 0) {
          state += ' <span class="badge bg-danger">incidents</span>';
        }

        $("#process-instance-state").html(state);

        $("#process-page-key").html(
            '<a href="/view/process/' + process.key + '">'
            + process.key
            + '</a>'
            + ' <span class="text-muted">(' + process.bpmnProcessId + ')</span>'
        );

        if (!isProcessInstanceActive(processInstance)) {
          disableProcessInstanceActionButtons();
        }

        if (!bpmnViewIsLoaded) {
          const bpmnXML = process.bpmnXML;
          showBpmn(bpmnXML);

          bpmnViewIsLoaded = true;
        }
      });

  loadVariablesOfProcessInstance();
  loadElementInstancesOfProcessInstance();
  loadJobsOfProcessInstance();
  loadIncidentsOfProcessInstance();
  loadMessageSubscriptionsOfProcessInstance();
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

          let scopeElement = formatBpmnElementInstance(scope);

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

          let elementFormatted = formatBpmnElementInstance(elementInstance);

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

function formatElementInstanceState(state) {
  switch (state) {
    case "ACTIVATING":
      return '<span class="badge bg-primary">activating</span>';
    case "ACTIVATED":
      return '<span class="badge bg-primary">activated</span>';
    case "COMPLETING":
      return '<span class="badge bg-secondary">completing</span>';
    case "COMPLETED":
      return '<span class="badge bg-secondary">completed</span>';
    case "TERMINATING":
      return '<span class="badge bg-dark">terminating</span>';
    case "TERMINATED":
      return '<span class="badge bg-dark">terminated</span>';
    case "TAKEN":
      return '<span class="badge bg-secondary">taken</span>';
    default:
      return "?"
  }
}

function formatBpmnElement(bpmnElementType) {
  switch (bpmnElementType) {
    case "PROCESS":
      return '<span class="bpmn-icon-participant"></span>';
    case "START_EVENT":
      return '<span class="bpmn-icon-start-event-none"></span>';
    case "SEQUENCE_FLOW":
      return '<span class="bpmn-icon-connection"></span>';
    case "SERVICE_TASK":
      return '<span class="bpmn-icon-service-task"></span>';
    case "EXCLUSIVE_GATEWAY":
      return '<span class="bpmn-icon-gateway-xor"></span>';
    case "PARALLEL_GATEWAY":
      return '<span class="bpmn-icon-gateway-parallel"></span>';
    case "EVENT_BASED_GATEWAY":
      return '<span class="bpmn-icon-gateway-eventbased"></span>';
    case "SUB_PROCESS":
      return '<span class="bpmn-icon-subprocess-expanded"></span>';
    case "EVENT_SUB_PROCESS":
      return '<span class="bpmn-icon-event-subprocess-expanded"></span>';
    case "INTERMEDIATE_CATCH_EVENT":
      return '<span class="bpmn-icon-intermediate-event-none"></span>';
    case "INTERMEDIATE_THROW_EVENT":
      return '<span class="bpmn-icon-intermediate-event-none"></span>';
    case "BOUNDARY_EVENT":
      return '<span class="bpmn-icon-intermediate-event-none"></span>';
    case "END_EVENT":
      return '<span class="bpmn-icon-end-event-none"></span>';
    case "RECEIVE_TASK":
      return '<span class="bpmn-icon-receive-task"></span>';
    case "USER_TASK":
      return '<span class="bpmn-icon-user-task"></span>';
    case "MANUAL_TASK":
      return '<span class="bpmn-icon-manual-task"></span>';
    case "MULTI_INSTANCE_BODY":
      return '<span class="bpmn-icon-parallel-mi-marker"></span>';
    case "CALL_ACTIVITY":
      return '<span class="bpmn-icon-subprocess-collapsed"></span>';
    case "BUSINESS_RULE_TASK":
      return '<span class="bpmn-icon-business-rule-task"></span>';
    case "SCRIPT_TASK":
      return '<span class="bpmn-icon-script-task"></span>';
    case "SEND_TASK":
      return '<span class="bpmn-icon-send-task"></span>';
    default:
      return "?";
  }
}

function formatBpmnElementInstance(elementInstance) {
  let bpmnElement = formatBpmnElement(elementInstance.bpmnElementType);

  let elementFormatted = ' <button type="button" class="btn btn-sm btn-outline-light text-dark" title="Highlight element" onclick="highlightElement(\'' + elementInstance.elementId + '\');">'
      + bpmnElement + ' ';
  if (elementInstance.elementName) {
    elementFormatted += elementInstance.elementName;
  } else {
    elementFormatted += elementInstance.elementId;
  }
  elementFormatted += '</button>';

  return elementFormatted;
}

function markElementInstances(processInstance) {

  processInstance.elementInstances.forEach((elementInstance) => {
    removeBpmnElementMarkers(elementInstance.elementId);
  });

  processInstance.activeElementInstances.forEach((elementInstance) => {
    if (elementInstance.bpmnElementType !== 'PROCESS') {
      markBpmnElementAsActive(elementInstance.elementId);
    }
  });

  processInstance.takenSequenceFlows.forEach((sequenceFlow) => {
    markSequenceFlow(sequenceFlow.elementId);
  });

  processInstance.elementInstancesWithIncidents.forEach((incidents) => {
    let elementId = incidents.elementInstance.elementId;
    markBpmnElementWithIncident(elementId);
  });

  addElementCounters(processInstance);
}



function addElementCounters(processInstance) {
  let elementCounters = {};

  processInstance.activeElementInstances.forEach((elementInstance) => {
    updateElementCounter(elementCounters, elementInstance, function (counter) {
      counter.active += 1;
    })
  });

  processInstance.completedElementInstances.forEach((elementInstance) => {
    updateElementCounter(elementCounters, elementInstance, function (counter) {
      counter.completed += 1;
    })
  });

  processInstance.terminatedElementInstances.forEach((elementInstance) => {
    updateElementCounter(elementCounters, elementInstance, function (counter) {
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

function updateElementCounter(elementCounters, elementInstance, updateCounter) {
  if (elementInstance.bpmnElementType === 'PROCESS') {
    return
  }
  let elementId = elementInstance.elementId;
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

          let elementFormatted = formatBpmnElementInstance(job.elementInstance);

          const elementId = job.elementInstance.elementId;

          let endTime = '';
          if (job.endTime) {
            endTime = job.endTime;
          }

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
              + '<td>' + job.startTime +'</td>'
              + '<td>' + endTime +'</td>'
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

function formatJobState(state) {
  switch (state) {
    case "ACTIVATABLE":
      return '<span class="badge bg-primary">active</span>';
    case "COMPLETED":
      return '<span class="badge bg-secondary">completed</span>';
    case "FAILED":
      return '<span class="badge bg-danger">failed</span>';
    case "CANCELED":
      return '<span class="badge bg-dark">canceled</span>';
    case "ERROR_THROWN":
      return '<span class="badge bg-warning">error thrown</span>';
    default:
      return "?"
  }
}

function completeJob(jobKey, variables) {
  const toastId = "job-complete-" + jobKey;

  sendCompleteJobRequest(jobKey, variables)
      .done(key => {
        showNotificationSuccess(toastId, "Job <code>" + jobKey + "</code> completed.");

        loadProcessInstanceView();
      })
      .fail(showFailure(toastId,
          "Failed to complete job <code>" + jobKey + "</code>.")
      );
}

function failJob(jobKey, retries, errorMessage) {
  const toastId = "job-fail-" + jobKey;

  sendFailJobRequest(jobKey, retries, errorMessage)
      .done(key => {
        showNotificationSuccess(toastId, "Job <code>" + jobKey + "</code> failed.");

        loadProcessInstanceView();
      })
      .fail(showFailure(toastId,
          "Failed to fail job <code>" + jobKey + "</code>.")
      );
}

function throwErrorJob(jobKey, errorCode, errorMessage) {
  const toastId = "job-throw-error-" + jobKey;

  sendThrowErrorJobRequest(jobKey, errorCode, errorMessage)
      .done(key => {
        showNotificationSuccess(toastId, "An error <code>" + errorCode + "</code> was thrown for the job <code>" + jobKey + "</code>.");

        loadProcessInstanceView();
      })
      .fail(showFailure(toastId,
          "Failed to throw error for the job <code>" + jobKey + "</code>.")
      );
}

function fillJobModal(jobKey, type) {
  $("#jobKey-" + type).val(jobKey);
}

function completeJobModal() {
  const jobKey = $("#jobKey-complete").val();
  const jobVariables = $("#jobVariables").val();

  completeJob(jobKey, jobVariables);
}

function failJobModal() {
  const jobKey = $("#jobKey-fail").val();
  const retries = $("#jobRetries").val();
  const errorMessage = $("#jobErrorMessage").val();

  failJob(jobKey, retries, errorMessage);
}

function throwErrorJobModal() {
  const jobKey = $("#jobKey-throw-error").val();
  const errorCode = $("#jobErrorCode").val();
  const errorMessage = $("#job-throw-error-errorMessage").val();

  throwErrorJob(jobKey, errorCode, errorMessage);
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

          let elementFormatted = formatBpmnElementInstance(incident.elementInstance);
          const elementId = incident.elementInstance.elementId;

          let resolveTime = '';
          if (incident.resolveTime) {
            resolveTime = incident.resolveTime;
          }

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
              + '<td>' + incident.creationTime +'</td>'
              + '<td>' + resolveTime +'</td>'
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

function formatIncidentState(state) {
  switch (state) {
    case "CREATED":
      return '<span class="badge bg-primary">created</span>';
    case "RESOLVED":
      return '<span class="badge bg-secondary">resolved</span>';
    default:
      return "?"
  }
}

function resolveIncident(incidentKey, jobKey) {
  const toastId = "job-update-retries-" + jobKey;

  if (jobKey) {
    sendUpdateRetriesJobRequest(jobKey, 1)
        .done(key => {
          showNotificationSuccess(toastId, "Retries of job <code>" + jobKey + "</code> increase.");

          resolveIncidentByKey(incidentKey);
        })
        .fail(showFailure(toastId,
            "Failed to update retries of the job <code>" + jobKey + "</code>.")
        );

  } else {
    resolveIncidentByKey(incidentKey);
  }
}

function resolveIncidentByKey(incidentKey) {
  const toastId = "incident-resolve-" + incidentKey;
  sendResolveIncidentRequest(incidentKey)
      .done(key => {
        showNotificationSuccess(toastId, "Incident <code>" + incidentKey + "</code> resolved.");

        loadProcessInstanceView();
      })
      .fail(showFailure(toastId,
          "Failed to resolve incident <code>" + incidentKey + "</code>.")
      );
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

          let elementFormatted = formatBpmnElementInstance(messageSubscription.elementInstance);
          const elementId = messageSubscription.elementInstance.elementId;

          let state = formatMessageSubscriptionState(messageSubscription.state);

          const isActiveMessageSubscription = messageSubscription.state === "CREATED" || (
              messageSubscription.state === "CORRELATED" && messageSubscription.elementInstance.state === 'ACTIVATED');

          let correlatedMessageCount = messageSubscription.messageCorrelations.length;

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
              + '<td><span class="badge bg-secondary">' + correlatedMessageCount + '</span></td>'
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

function formatMessageSubscriptionState(state) {
  switch (state) {
    case "CREATED":
      return '<span class="badge bg-primary">created</span>';
    case "CORRELATED":
      return '<span class="badge bg-secondary">correlated</span>';
    case "DELETED":
      return '<span class="badge bg-secondary">deleted</span>';
    default:
      return "?"
  }
}