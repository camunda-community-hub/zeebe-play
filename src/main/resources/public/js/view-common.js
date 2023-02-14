function updatePagination(prefix, perPage, currentPage, totalCount) {
  let previousButton = $("#" + prefix + "-pagination-previous-button");
  let first = $("#" + prefix + "-pagination-first");
  let firstGap = $("#" + prefix + "-pagination-first-gap");
  let previous = $("#" + prefix + "-pagination-previous");
  let current = $("#" + prefix + "-pagination-current");
  let next = $("#" + prefix + "-pagination-next");
  let lastGap = $("#" + prefix + "-pagination-last-gap");
  let last = $("#" + prefix + "-pagination-last");
  let nextButton = $("#" + prefix + "-pagination-next-button");

  // first.text(1);
  previous.text(currentPage - 1 + 1);
  current.text(currentPage + 1);
  next.text(currentPage + 1 + 1);

  let lastPage = Math.trunc(totalCount / perPage);

  if (totalCount % perPage == 0) {
    lastPage = lastPage - 1;
  }
  last.text(lastPage + 1);

  if (currentPage < 3) {
    firstGap.addClass("d-none");
  } else {
    firstGap.removeClass("d-none");
  }

  if (currentPage < 2) {
    first.addClass("d-none");
  } else {
    first.removeClass("d-none");
  }

  if (currentPage < 1) {
    previous.addClass("d-none");
    previousButton.addClass("disabled");
  } else {
    previous.removeClass("d-none");
    previousButton.removeClass("disabled");
  }

  if (currentPage > lastPage - 3) {
    lastGap.addClass("d-none");
  } else {
    lastGap.removeClass("d-none");
  }

  if (currentPage > lastPage - 2) {
    last.addClass("d-none");
  } else {
    last.removeClass("d-none");
  }

  if (currentPage > lastPage - 1) {
    next.addClass("d-none");
    nextButton.addClass("disabled");
  } else {
    next.removeClass("d-none");
    nextButton.removeClass("disabled");
  }
}

function showNotificationSuccess(id, content) {
  const toastId = "new-toast-" + id;

  const newNotificationToast =
    '<div id="' +
    toastId +
    '" class="toast" role="status" aria-live="polite" aria-atomic="true">' +
    '<div class="toast-header bg-success text-white">' +
    '<strong class="me-auto">Success</strong>' +
    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>' +
    "</div>" +
    '<div class="toast-body">' +
    content +
    "</div>" +
    "</div>";

  let notificationToastContainer = $("#notifications-toast-container");

  notificationToastContainer.append(newNotificationToast);

  let newInstanceToast = $("#" + toastId);
  let toast = new bootstrap.Toast(newInstanceToast);
  toast.show();
}

function showNotificationFailure(id, content) {
  const toastId = "new-toast-" + id;

  const newNotificationToast =
    '<div id="' +
    toastId +
    '" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">' +
    '<div class="toast-header bg-danger text-white">' +
    '<strong class="me-auto">Failure</strong>' +
    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>' +
    "</div>" +
    '<div class="toast-body">' +
    content +
    "</div>" +
    "</div>";

  let notificationToastContainer = $("#notifications-toast-container");

  notificationToastContainer.append(newNotificationToast);

  let newInstanceToast = $("#" + toastId);
  let toast = new bootstrap.Toast(newInstanceToast);
  toast.show();
}

function showNotificationWarning(id, content) {
  const toastId = "new-toast-" + id;

  const newNotificationToast = `
    <div id="${toastId}" class="toast" role="warning" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
      <div class="toast-header bg-warning text-white">
        <strong class="me-auto">Warning</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${content}
      </div>
    </div>`;

  let notificationToastContainer = $("#notifications-toast-container");

  notificationToastContainer.append(newNotificationToast);

  let newInstanceToast = $("#" + toastId);
  let toast = new bootstrap.Toast(newInstanceToast);
  toast.show();
}

function showFailure(actionId, message) {
  return function (xhr, status, error) {
    const toastId = actionId;
    const responseJSON = xhr.responseJSON;

    let failureMessage = `<code>${error}</code>`;
    if (responseJSON) {
      failureMessage = `<code>${responseJSON.message}</code>`;

      if (responseJSON.failureType === "COMMAND_REJECTION") {
        failureMessage = `The command was rejected (Status: <code>${responseJSON.message}</code>).`;
      }

      if (responseJSON.details) {
        failureMessage += `
          <div class="mt-2 pt-2 border-top">
            <details>
              <summary>Details</summary>
              <code>${responseJSON.details}</code>
            </details>
          </div>`;
      }
    }

    const content = message + " " + failureMessage;

    showNotificationFailure(toastId, content);
  };
}

function getCurrentView() {
  return $("#current-view").text();
}

function loadView() {
  switch (getCurrentView()) {
    case "process": {
      loadProcessView();
      break;
    }
    case "process-instance": {
      loadProcessInstanceView();
      break;
    }
    default: {
      console.debug("Unable to load view: view is unknown");
    }
  }
}

let timer;

function loadViewDebounced(delay = 150) {
  clearTimeout(timer);
  timer = setTimeout(loadView, delay);
}

// ----------------------------------------

function formatProcessInstanceState(processInstance) {
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
      state = "?";
  }

  const incidents = processInstance.incidents;
  if (incidents && incidents.length > 0) {
    state += ' <span class="badge bg-danger">incidents</span>';
  }

  const error = processInstance.error;
  if (error) {
    const fillErrorModalAction =
      "fillErrorDetailsModal('" + processInstance.key + "');";
    state +=
      ' <span class="badge bg-warning">error</span>' +
      ' <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#error-detail-modal" title="Show error details" onclick="' +
      fillErrorModalAction +
      '">' +
      '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>' +
      "</button>";
  }

  return state;
}

function formatTimerState(state) {
  switch (state) {
    case "CREATED":
      return '<span class="badge bg-primary">created</span>';
    case "TRIGGERED":
      return '<span class="badge bg-secondary">triggered</span>';
    case "CANCELED":
      return '<span class="badge bg-dark">canceled</span>';
    default:
      return "?";
  }
}

function formatTimerRepetitions(timer) {
  if (timer.repetitions < 0) {
    // show infinity symbol
    return '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#infinity"/></svg>';
  } else {
    return timer.repetitions;
  }
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
      return "?";
  }
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
      return "?";
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
    case "INCLUSIVE_GATEWAY":
      return '<span class="bpmn-icon-gateway-or"></span>';
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

function formatBpmnElementInstance(element) {
  const bpmnElement = formatBpmnElement(element.bpmnElementType);
  const action = "highlightElement('" + element.elementId + "');";

  const highlightButton =
    '<button type="button" class="btn btn-sm btn-outline-light text-dark" title="Highlight element"  onclick="' +
    action +
    '">' +
    '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#geo-alt"/></svg>' +
    "</button> ";

  let elementFormatted = highlightButton + bpmnElement + " ";
  if (element.elementName) {
    elementFormatted += element.elementName;
  } else {
    elementFormatted += element.elementId;
  }
  return elementFormatted;
}

function formatIncidentState(state) {
  switch (state) {
    case "CREATED":
      return '<span class="badge bg-primary">created</span>';
    case "RESOLVED":
      return '<span class="badge bg-secondary">resolved</span>';
    default:
      return "?";
  }
}

function formatMessageSubscriptionState(state) {
  switch (state) {
    case "CREATED":
      return '<span class="badge bg-primary">created</span>';
    case "CORRELATED":
      return '<span class="badge bg-secondary">correlated</span>';
    case "DELETED":
      return '<span class="badge bg-dark">deleted</span>';
    default:
      return "?";
  }
}

function formatMessageState(state) {
  switch (state) {
    case "PUBLISHED":
      return '<span class="badge bg-primary">published</span>';
    case "EXPIRED":
      return '<span class="badge bg-secondary">expired</span>';
    default:
      return "?";
  }
}

function showInfoOfBpmnElement(element) {
  const elementId = element.elementId;
  const bpmnElementType = element.bpmnElementType;
  const metadata = element.metadata;

  let info;
  if (metadata.jobType) {
    info = "job type: " + metadata.jobType;
  }
  if (metadata.conditionExpression) {
    info = "condition: " + metadata.conditionExpression;
  }
  if (metadata.timerDefinition) {
    info = "timer: " + metadata.timerDefinition;
  }
  if (metadata.errorCode) {
    info = "error code: " + metadata.errorCode;
  }
  if (metadata.calledProcessId) {
    info = "called process id: " + metadata.calledProcessId;
  }
  if (metadata.messageSubscriptionDefinition) {
    let subscription = metadata.messageSubscriptionDefinition;
    info = "message name: " + subscription.messageName;
    if (subscription.messageCorrelationKey) {
      info += "<br>" + "correlation key: " + subscription.messageCorrelationKey;
    }
  }
  if (metadata.userTaskAssignmentDefinition) {
    let userTask = metadata.userTaskAssignmentDefinition;
    if (userTask.assignee) {
      info = "assignee: " + userTask.assignee;
    }

    if (userTask.candidateGroups) {
      if (info) {
        info += "<br> candidateGroups: " + userTask.candidateGroups;
      } else {
        info = "candidateGroups: " + userTask.candidateGroups;
      }
    }
  }

  if (info) {
    showElementInfo(elementId, bpmnElementType, info);
  }
}

// ----------------------------------------------------------

function publishMessage(messageName, messageCorrelationKey) {
  history.push({
    action: "publishMessage",
    messageName,
    messageCorrelationKey,
  });
  refreshHistory();

  sendPublishMessageRequest(messageName, messageCorrelationKey)
    .done((messageKey) => {
      const toastId = "message-published-" + messageKey;
      const content = "New message <code>" + messageKey + "</code> published.";
      showNotificationSuccess(toastId, content);
    })
    .fail(
      showFailure(
        "publish-message-failed-" + messageName,
        "Failed to publish message"
      )
    );
}

function fillPublishMessageModal(messageName, correlationKey) {
  $("#publishMessageName").val(messageName);

  if (correlationKey) {
    $("#publishMessageCorrelationKey").val(correlationKey);
  }
}

function publishMessageModal() {
  const messageName = $("#publishMessageName").val();
  const messageCorrelationKey = $("#publishMessageCorrelationKey").val();
  const variables = $("#publishMessageVariables").val();
  const timeToLive = $("#publishMessageTimeToLive").val();
  const messageId = $("#publishMessageId").val();

  history.push({
    action: "publishMessage",
    messageName,
    messageCorrelationKey,
    variables,
    timeToLive,
    messageId,
  });
  refreshHistory();

  sendPublishMessageRequest(
    messageName,
    messageCorrelationKey,
    variables,
    timeToLive,
    messageId
  )
    .done((messageKey) => {
      const toastId = "message-published-" + messageKey;
      const content = "New message <code>" + messageKey + "</code> published.";
      showNotificationSuccess(toastId, content);
    })
    .fail(showFailure("publish-message-failed", "Failed to publish message"));
}

function timeTravel(timeDefinition, elementId) {
  history.push({ action: "timeTravel", elementId, timeDefinition });
  refreshHistory();

  const index = timeDefinition.indexOf("P");

  let successMessage;

  let request;
  if (index >= 0) {
    let duration = timeDefinition.substring(index);
    request = sendTimeTravelRequestWithDuration(duration);

    successMessage = "Time travel by <code>" + duration + "</code>.";
  } else {
    let dateTime = timeDefinition;
    request = sendTimeTravelRequestWithDateTime(dateTime);

    successMessage = "Time travel to <code>" + dateTime + "</code>.";
  }

  request
    .done((newTime) => {
      const toastId = "time-travel-" + newTime;
      showNotificationSuccess(toastId, successMessage);
    })
    .fail(showFailure("time-travel-failed", "Failed to time travel"));
}

let timeTravelModalElementId;

function fillTimeTravelModal(timeDefinition, elementId) {
  timeTravelModalElementId = elementId;
  const index = timeDefinition.indexOf("P");

  const timeDuration = $("#timeDuration");
  const timeDate = $("#timeDate");

  timeDuration.val("");
  timeDate.val("");

  if (index >= 0) {
    const duration = timeDefinition.substring(index);
    timeDuration.val(duration);
  } else {
    timeDate.val(timeDefinition);
  }
}

function timeTravelModal() {
  const timeDuration = $("#timeDuration").val();
  const timeDate = $("#timeDate").val();

  if (timeDuration && timeDuration.length > 0) {
    timeTravel(timeDuration, timeTravelModalElementId);
  } else if (timeDate && timeDate.length > 0) {
    timeTravel(timeDate, timeTravelModalElementId);
  }
}

function completeJob(jobKey, variables) {
  const toastId = "job-complete-" + jobKey;

  const task = jobKeyToElementIdMapping[jobKey];
  if (task) {
    localStorage.setItem(
      "jobCompletion " + getBpmnProcessId() + " " + task,
      variables
    );
  }

  history.push({ action: "completeJob", task, variables });
  refreshHistory();

  sendCompleteJobRequest(jobKey, variables)
    .done((key) => {
      showNotificationSuccess(
        toastId,
        "Job <code>" + jobKey + "</code> completed."
      );
    })
    .fail(
      showFailure(
        toastId,
        "Failed to complete job <code>" + jobKey + "</code>."
      )
    );
}

function failJob(jobKey, retries, errorMessage) {
  const toastId = "job-fail-" + jobKey;

  const task = jobKeyToElementIdMapping[jobKey];
  history.push({ action: "failJob", task, retries, errorMessage });
  refreshHistory();

  sendFailJobRequest(jobKey, retries, errorMessage)
    .done((key) => {
      showNotificationSuccess(
        toastId,
        "Job <code>" + jobKey + "</code> failed."
      );
    })
    .fail(
      showFailure(toastId, "Failed to fail job <code>" + jobKey + "</code>.")
    );
}

function throwErrorJob(jobKey, errorCode, errorMessage) {
  const toastId = "job-throw-error-" + jobKey;

  const task = jobKeyToElementIdMapping[jobKey];
  history.push({ action: "throwJob", task, errorCode, errorMessage });
  refreshHistory();

  sendThrowErrorJobRequest(jobKey, errorCode, errorMessage)
    .done((key) => {
      showNotificationSuccess(
        toastId,
        "An error <code>" +
          errorCode +
          "</code> was thrown for the job <code>" +
          jobKey +
          "</code>."
      );
    })
    .fail(
      showFailure(
        toastId,
        "Failed to throw error for the job <code>" + jobKey + "</code>."
      )
    );
}

function executeConnectorJob(jobType, jobKey) {
  const toastId = "connector-job-" + jobKey;

  sendExecuteConnectorRequest(jobType, jobKey)
    .done((key) => {
      showNotificationSuccess(
        toastId,
        `Connector of type <code>${jobType}</code> invoked.`
      );
    })
    .fail(
      showFailure(
        toastId,
        `Failed to invoke connector of type <code>${jobType}</code>.`
      )
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

function resolveIncident(incidentKey, jobKey) {
  const toastId = "job-update-retries-" + jobKey;

  if (jobKey) {
    sendUpdateRetriesJobRequest(jobKey, 1)
      .done((key) => {
        showNotificationSuccess(
          toastId,
          "Retries of job <code>" + jobKey + "</code> increase."
        );

        resolveIncidentByKey(incidentKey);
      })
      .fail(
        showFailure(
          toastId,
          "Failed to update retries of the job <code>" + jobKey + "</code>."
        )
      );
  } else {
    resolveIncidentByKey(incidentKey);
  }
}

function resolveIncidentByKey(incidentKey) {
  const toastId = "incident-resolve-" + incidentKey;
  sendResolveIncidentRequest(incidentKey)
    .done((key) => {
      showNotificationSuccess(
        toastId,
        "Incident <code>" + incidentKey + "</code> resolved."
      );
    })
    .fail(
      showFailure(
        toastId,
        "Failed to resolve incident <code>" + incidentKey + "</code>."
      )
    );
}

function fillMessageDetailsModal(messageKey) {
  queryMessageByKey(messageKey).done(function (response) {
    const message = response.data.message;

    let variables = {};
    message.variables.forEach((variable) => {
      variables[variable.name] = variable.value;
    });
    const variablesFormatted = JSON.stringify(variables);

    $("#messageKey").val(message.key);
    $("#messageName").val(message.name);
    $("#messageCorrelationKey").val(message.correlationKey);
    $("#messageVariables").val(variablesFormatted);
    $("#messageTimeToLive").val(message.timeToLive);
    $("#messageId").val(message.messageId);
  });
}

function fillErrorDetailsModal(processInstanceKey) {
  queryErrorByProcessInstanceKey(processInstanceKey).done(function (response) {
    const processInstance = response.data.processInstance;
    const error = processInstance.error;

    if (error) {
      $("#error-exceptionMessage").val(error.exceptionMessage);
      $("#error-stacktrace").val(error.stacktrace);
    }
  });
}

function checkForMissingConnectorSecrets(processKey) {
  sendGetMissingConnectSecretsRequest(processKey).done((response) => {
    let connectorSecretNames = response.connectorSecretNames;
    if (connectorSecretNames.length > 0) {
      let buttonId = "add-missing-connector-secrets";

      showNotificationWarning(
        "connector-secrets-missing",
        `Connector secrets are missing. The process references secrets that are not set yet.
                <div class="mt-2 pt-2 border-top">
                  <button id="${buttonId}" type="button" class="btn btn-outline-primary btn-sm">Add missing secrets</button>
                </div>`
      );

      $("#" + buttonId).click(function () {
        let newSecrets = connectorSecretNames.map(function (name) {
          return {
            name: name,
            value: "ENTER_YOUR_SECRET",
          };
        });

        sendAddConnectorSecretsRequest(newSecrets).done((response) => {
          // switch to connector secrets page
          window.location.href = "/view/connectors";
        });
      });
    }
  });
}
