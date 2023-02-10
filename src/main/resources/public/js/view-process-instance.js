var bpmnViewIsLoaded = false;
var markedBpmnElement;

var isElementCountersViewEnabled = false;

const jobKeyToElementIdMapping = {};

function getProcessInstanceKey() {
  return $("#process-instance-page-key").text();
}

function getBpmnProcessId() {
  return $("#bpmn-process-id").text();
}

let currentProcessKey;
const history = JSON.parse(
  localStorage.getItem("history " + window.getProcessInstanceKey?.()) || "[]"
);

function refreshHistory() {
  const key = getProcessInstanceKey();

  const historyEntries = JSON.parse(
    localStorage.getItem("historyEntries") || "[]"
  );
  if (!historyEntries.includes(key)) {
    historyEntries.push(key);
  }
  while (historyEntries.length > 20) {
    const keyToDelete = historyEntries.shift();
    localStorage.removeItem("history " + keyToDelete);
  }

  localStorage.setItem("historyEntries", JSON.stringify(historyEntries));
  localStorage.setItem("history " + key, JSON.stringify(history));
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

  queryProcessInstance(processInstanceKey).done(function (response) {
    let processInstance = response.data.processInstance;
    let process = processInstance.process;

    currentProcessKey = process.key;

    $("#process-instance-key").text(processInstance.key);
    $("#process-instance-start-time").text(processInstance.startTime);

    let endTime = "-";
    if (processInstance.endTime) {
      endTime = processInstance.endTime;
    }

    $("#process-instance-end-time").text(endTime);

    let state = formatProcessInstanceState(processInstance);

    $("#process-instance-state").html(state);

    $("#bpmn-process-id").html(
      '<a href="/view/process/' +
        process.key +
        '">' +
        process.bpmnProcessId +
        "</a>"
    );

    if (!isProcessInstanceActive(processInstance)) {
      disableProcessInstanceActionButtons();
    }

    if (!bpmnViewIsLoaded) {
      subscribeToUpdates("processInstanceKey", processInstance.key, () =>
        loadViewDebounced()
      );

      checkForMissingConnectorSecrets(process.key);

      const bpmnXML = process.bpmnXML;
      showBpmn(bpmnXML).then(function (r) {
        // wait until BPMN is loaded
        loadProcessInstanceDetailsViews();
        loadElementInfoOfProcessInstance();
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
  loadUserTasksOfProcessInstance();
  loadIncidentsOfProcessInstance();
  loadMessageSubscriptionsOfProcessInstance();
  loadTimersOfProcessInstance();
  loadChildInstancesOfProcessInstance();

  makeTasksReplayable();
}

function makeTasksReplayable() {
  const tasks = new Set(
    history
      .filter(({ action }) => action === "completeJob")
      .map(({ task }) => task)
  );

  tasks.forEach((task) => {
    overlays.add(task, "rewind-marker", {
      position: {
        top: -15,
        left: -15,
      },
      html:
        '<button type="button" class="btn btn-sm btn-outline-secondary overlay-button rewind-button" title="Rewind to this element" onclick=\'rewind("' +
        task +
        "\")'>" +
        '<svg class="bi" width="14" height="14" style="fill: black;"><use xlink:href="/img/bootstrap-icons.svg#rewind"/></svg>' +
        "</button>",
    });
  });
}

async function rewind(task) {
  const blocker = document.createElement("div");
  blocker.setAttribute("id", "rewind-blocker");
  blocker.innerHTML =
    '<svg class="bi" style="fill: black;"><use xlink:href="/img/bootstrap-icons.svg#rewind-fill"/></svg> Rewinding…';
  document.body.appendChild(blocker);
  document.body.style.overflow = "hidden";
  scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });
  setTimeout(() => (blocker.style.opacity = 1));

  let newId, newHistory;
  try {
    const startEvent = await getStartEvent(getProcessInstanceKey());

    if (!startEvent.eventDefinitions) {
      // none start event, could be started with variables
      let startVariables = {};
      if (history[0]?.action === "start") {
        startVariables = history[0].variables;
      } else if (getBpmnProcessId() === "solos-transport-process") {
        startVariables = {
          captain: "Han Solo",
          ship: "Millennium Falcon",
        };
      }
      newId = await sendCreateInstanceRequest(
        currentProcessKey,
        startVariables
      );
    } else if (
      startEvent.eventDefinitions[0].$type === "bpmn:MessageEventDefinition"
    ) {
      // message start event
      newId = await createNewInstanceFromMessageStartEvent(startEvent);
    } else if (
      startEvent.eventDefinitions[0].$type === "bpmn:TimerEventDefinition"
    ) {
      // timer start event
      newId = await createNewInstanceFromTimerStartEvent(startEvent);
    }

    newHistory = [];

    for (let i = 0; i < history.length; i++) {
      const step = history[i];

      if (step.task === task) {
        break;
      }

      switch (step.action) {
        case "start":
          break; // start action is already handled when new instance was created
        case "publishMessage":
          await waitForMessageSubscription(
            newId,
            step.messageName,
            step.messageCorrelationKey
          );
          await sendPublishMessageRequest(
            step.messageName,
            step.messageCorrelationKey,
            step.variables,
            step.timeToLive,
            step.messageId
          );
          break;
        case "timeTravel":
          const timer = await fetchTimerForElement(newId, step.elementId);
          await sendTimeTravelRequestWithDateTime(timer.dueDate);
          break;
        case "completeJob": {
          const jobKey = await fetchJobKeyForTask(newId, step.task);
          await sendCompleteJobRequest(jobKey, step.variables);
          break;
        }
        case "failJob": {
          const jobKey = await fetchJobKeyForTask(newId, step.task);
          await sendFailJobRequest(jobKey, step.retries, step.errorMessage);
          break;
        }
        case "throwJob": {
          const jobKey = await fetchJobKeyForTask(newId, step.task);
          await sendThrowErrorJobRequest(
            jobKey,
            step.errorCode,
            step.errorMessage
          );
          break;
        }
        default:
          console.error("Unknown rewind action: " + step.action);
      }
      newHistory.push(step);
    }
  } catch (e) {
    // could not finish the rewinding. This could be due to missing history or failed requests
    // in this case, we still want to send the user to the newly created instance

    if (!newId) {
      // if it failed while creating the new instance, we should remove the blocker again and inform the user
      document.body.removeChild(blocker);
      showNotificationFailure(
        "rewind-failure",
        "Could not rewind this process instance." +
          "<br /><br />" +
          '<a href="https://github.com/camunda-community-hub/zeebe-play/issues/new?assignees=&labels=bug&template=bug_report.md&title=">' +
          "Please file a bug report!" +
          "</a>"
      );
    }
  }

  if (newId && newHistory) {
    localStorage.setItem("history " + newId, JSON.stringify(newHistory));
    window.location.href = "/view/process-instance/" + newId;
  }
}

async function getStartEvent(processInstanceKey) {
  const response = await queryElementInstancesByProcessInstance(
    processInstanceKey
  );

  const elementId =
    response.data.processInstance?.completedElementInstances.find(
      ({ element }) => element.bpmnElementType === "START_EVENT"
    )?.element.elementId;

  return elementRegistry.get(elementId)?.businessObject;
}

async function createNewInstanceFromTimerStartEvent(startEvent) {
  const timers = await queryTimersByProcess(currentProcessKey);

  const correctTimer = timers.data.process.timers.find(
    (timer) =>
      timer.state === "CREATED" && timer.element.elementId === startEvent.id
  );

  const numberOfCurrentInstances = await getNumberOfCurrentInstancesFor(
    currentProcessKey
  );
  await sendTimeTravelRequestWithDateTime(correctTimer.dueDate);

  return await waitForNewInstanceFor(
    currentProcessKey,
    numberOfCurrentInstances
  );
}

async function createNewInstanceFromMessageStartEvent(startEvent) {
  const messageName = startEvent.eventDefinitions[0].messageRef.name;

  const numberOfCurrentInstances = await getNumberOfCurrentInstancesFor(
    currentProcessKey
  );
  await sendPublishMessageRequest(messageName);

  return await waitForNewInstanceFor(
    currentProcessKey,
    numberOfCurrentInstances
  );
}

async function getNumberOfCurrentInstancesFor(processKey) {
  const response = await queryInstancesByProcess(processKey, 1, 0);

  return response.data.process.processInstances.totalCount;
}

function waitForNewInstanceFor(processKey, numberOfExistingInstances) {
  return new Promise((resolve, reject) => {
    let remainingTries = 6;
    let interval = setInterval(() => {
      queryInstancesByProcess(processKey, 1, numberOfExistingInstances).done(
        (response) => {
          remainingTries--;

          const newInstance = response.data.process.processInstances.nodes[0];

          if (newInstance) {
            clearInterval(interval);
            return resolve(newInstance.key);
          }
          if (remainingTries === 0) {
            clearInterval(interval);
            return reject();
          }
        }
      );
    }, 250);
  });
}

function waitForMessageSubscription(id, messageName, correlationKey) {
  return new Promise((resolve, reject) => {
    let remainingTries = 6;
    let interval = setInterval(() => {
      queryMessageSubscriptionsByProcessInstance(id).done((response) => {
        remainingTries--;
        const subscription =
          response.data.processInstance.messageSubscriptions.some(
            (subscription) =>
              subscription.messageName === messageName &&
              subscription.messageCorrelationKey === correlationKey
          );
        if (subscription) {
          clearInterval(interval);
          return resolve();
        }
        if (remainingTries === 0) {
          clearInterval(interval);
          return reject();
        }
      });
    }, 250);
  });
}

function fetchTimerForElement(id, elementId) {
  return new Promise((resolve, reject) => {
    let remainingTries = 6;
    let interval = setInterval(() => {
      queryTimersByProcessInstance(id).done((response) => {
        remainingTries--;
        const timer = response.data.processInstance.timers.find(
          (timer) => timer.element.elementId === elementId
        );
        if (timer) {
          clearInterval(interval);
          return resolve(timer);
        }
        if (remainingTries === 0) {
          clearInterval(interval);
          return reject();
        }
      });
    }, 250);
  });
}

function fetchJobKeyForTask(id, task) {
  return new Promise((resolve, reject) => {
    let remainingTries = 6;
    let interval = setInterval(() => {
      remainingTries--;
      if (remainingTries === 0) {
        clearInterval(interval);
        return reject();
      }
      queryUserTasksByProcessInstance(id).done((response) => {
        response.data.processInstance.userTasks.nodes.forEach((userTask) => {
          if (
            userTask.elementInstance.element.elementId === task &&
            userTask.state !== "COMPLETED"
          ) {
            clearInterval(interval);
            resolve(userTask.key);
          }
        });
      });
      queryJobsByProcessInstance(id).done((response) => {
        response.data.processInstance.jobs.forEach((job) => {
          if (
            job.elementInstance.element.elementId === task &&
            job.state !== "COMPLETED"
          ) {
            clearInterval(interval);
            resolve(job.key);
          }
        });
      });
    }, 250);
  });
}

function disableProcessInstanceActionButtons() {
  $("#process-instance-set-variables").addClass("disabled");
  $("#process-instance-cancel").addClass("disabled");
  $("#process-instance-publish-message").addClass("disabled");
  $("#process-instance-time-travel").addClass("disabled");
}

function loadVariablesOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryVariablesByProcessInstance(processInstanceKey).done(function (response) {
    let processInstance = response.data.processInstance;
    let variables = processInstance.variables;

    let totalCount = variables.length;
    $("#variables-total-count").text(totalCount);

    $("#variables-of-process-instance-table tbody").empty();

    const indexOffset = 1;

    variables.forEach((variable, index) => {
      let scope = variable.scope;

      let scopeFormatted;
      if (scope.element.bpmnElementType === "PROCESS") {
        scopeFormatted = '<span class="badge bg-primary">global</span>';
      } else {
        scopeFormatted = '<span class="badge bg-secondary">local</span>';
      }

      let scopeElement = formatBpmnElementInstance(scope.element);

      let valueFormatted = "<code>" + variable.value + "</code>";

      let lastUpdatedFormatted =
        '<div class="row row-cols-1">' +
        '<div class="col">' +
        variable.timestamp;

      let variableUpdatesId = "variable-updates-" + variable.key;

      if (variable.updates.length > 1) {
        lastUpdatedFormatted +=
          ' <span class="badge bg-secondary">modified</span>';
        lastUpdatedFormatted +=
          ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#' +
          variableUpdatesId +
          '" aria-expanded="false" title="Show updates">' +
          '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>' +
          "</button>";
      }

      lastUpdatedFormatted += "</div>";

      if (variable.updates.length > 1) {
        let variableUpdates =
          '<table class="table">' +
          "<thead>" +
          "<tr>" +
          '<th scope="col">Value</th>' +
          '<th scope="col">Update Time</th>' +
          "</tr>" +
          "</thead>" +
          "<tbody>";

        variable.updates.forEach((update) => {
          variableUpdates +=
            "<tr>" +
            "<td><code>" +
            update.value +
            "</code></td>" +
            "<td>" +
            update.timestamp +
            "</td>" +
            "</tr>";
        });

        variableUpdates += "</tbody></table>";

        lastUpdatedFormatted +=
          '<div class="collapse" id="' +
          variableUpdatesId +
          '">' +
          '<div class="col">' +
          variableUpdates +
          "</div>" +
          "</div>";
      }

      lastUpdatedFormatted += "</div>";

      let actionButton = "";
      if (isProcessInstanceActive(processInstance)) {
        let fillModalAction =
          "fillSetVariablesModal('" +
          scope.key +
          "', '" +
          variable.name +
          "', '" +
          variable.value.replace(/"/g, "&quot;") +
          "');";

        actionButton =
          '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#set-variable-modal" title="Edit" onclick="' +
          fillModalAction +
          '">' +
          '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#pencil"/></svg>' +
          " Edit" +
          "</button>";
      }

      $("#variables-of-process-instance-table > tbody:last-child").append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          variable.name +
          "</td>" +
          "<td>" +
          valueFormatted +
          "</td>" +
          "<td>" +
          scopeFormatted +
          "</td>" +
          "<td>" +
          scopeElement +
          "</td>" +
          "<td>" +
          scope.key +
          "</td>" +
          "<td>" +
          lastUpdatedFormatted +
          "</td>" +
          "<td>" +
          actionButton +
          "</td>" +
          "</tr>"
      );
    });
  });
}

function fillSetVariablesModal(scopeKey, variableName, variableValue) {
  let scope = scopeKey;
  if (scopeKey === getProcessInstanceKey()) {
    scope = "global";
  }
  $("#variablesScope").val(scope);

  let variables = '{"' + variableName + '": ' + variableValue + "}";
  $("#updatedVariables").val(variables);
}

function setVariablesModal() {
  let scope = $("#variablesScope").val();
  if (scope === "global") {
    scope = getProcessInstanceKey();
  }

  let variables = $("#updatedVariables").val();

  sendSetVariablesRequest(getProcessInstanceKey(), scope, variables)
    .done((key) => {
      const toastId = "set-variables-" + key;
      showNotificationSuccess(
        toastId,
        "Set variables <code>" + variables + "</code>."
      );

      loadVariablesOfProcessInstance();
    })
    .fail(
      showFailure(
        "set-variables" + scope,
        "Failed to set variables <code>" + variables + "</code>."
      )
    );
}

function cancelProcessInstance() {
  let processInstanceKey = getProcessInstanceKey();
  sendCancelProcessInstanceRequest(processInstanceKey)
    .done((key) => {
      const toastId = "cancel-process-instance-" + processInstanceKey;
      showNotificationSuccess(toastId, "Cancelled process instance.");
    })
    .fail(
      showFailure(
        "cancel-process-instance-" + processInstanceKey,
        "Failed to cancel process instance."
      )
    );
}

function loadElementInstancesOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryElementInstancesByProcessInstance(processInstanceKey).done(function (
    response
  ) {
    let processInstance = response.data.processInstance;
    let elementInstances = processInstance.elementInstances;

    let totalCount = elementInstances.length;

    $("#element-instances-total-count").text(totalCount);

    $("#element-instances-of-process-instance-table tbody").empty();

    const indexOffset = 1;

    elementInstances.forEach((elementInstance, index) => {
      let elementFormatted = formatBpmnElementInstance(elementInstance.element);

      let scopeFormatted = "";
      if (elementInstance.scope) {
        scopeFormatted = elementInstance.scope.key;
      }

      let endTime = "";
      if (elementInstance.endTime) {
        endTime = elementInstance.endTime;
      }

      let stateTransitionsId = "state-transitions-" + elementInstance.key;

      let stateFormatted =
        '<div class="row row-cols-1">' +
        '<div class="col">' +
        formatElementInstanceState(elementInstance.state) +
        ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#' +
        stateTransitionsId +
        '" aria-expanded="false" title="Show state transitions">' +
        '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>' +
        "</button>" +
        "</div>";

      let stateTransitions =
        '<table class="table">' +
        "<thead>" +
        "<tr>" +
        '<th scope="col">State</th>' +
        '<th scope="col">Timestamp</th>' +
        "</tr>" +
        "</thead>" +
        "<tbody>";

      elementInstance.stateTransitions.forEach((stateTransition) => {
        stateTransitions +=
          "<tr>" +
          "<td>" +
          formatElementInstanceState(stateTransition.state) +
          "</td>" +
          "<td>" +
          stateTransition.timestamp +
          "</td>" +
          "</tr>";
      });

      stateTransitions += "</tbody></table>";
      stateFormatted +=
        '<div class="collapse" id="' +
        stateTransitionsId +
        '">' +
        '<div class="col">' +
        stateTransitions +
        "</div>" +
        "</div>" +
        "</div>";

      $(
        "#element-instances-of-process-instance-table > tbody:last-child"
      ).append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          elementFormatted +
          "</td>" +
          "<td>" +
          elementInstance.key +
          "</td>" +
          "<td>" +
          scopeFormatted +
          "</td>" +
          "<td>" +
          stateFormatted +
          "</td>" +
          "<td>" +
          elementInstance.startTime +
          "</td>" +
          "<td>" +
          endTime +
          "</td>" +
          "</tr>"
      );
    });

    markElementInstances(processInstance);
  });
}

function markElementInstances(processInstance) {
  processInstance.elementInstances.forEach((elementInstance) => {
    let bpmnElement = elementInstance.element;
    if (bpmnElement.bpmnElementType !== "PROCESS") {
      removeBpmnElementMarkers(bpmnElement.elementId);
    }
  });

  processInstance.activeElementInstances.forEach((elementInstance) => {
    let bpmnElement = elementInstance.element;
    if (bpmnElement.bpmnElementType !== "PROCESS") {
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
    updateElementCounter(
      elementCounters,
      elementInstance.element,
      function (counter) {
        counter.active += 1;
      }
    );
  });

  processInstance.completedElementInstances.forEach((elementInstance) => {
    updateElementCounter(
      elementCounters,
      elementInstance.element,
      function (counter) {
        counter.completed += 1;
      }
    );
  });

  processInstance.terminatedElementInstances.forEach((elementInstance) => {
    updateElementCounter(
      elementCounters,
      elementInstance.element,
      function (counter) {
        counter.terminated += 1;
      }
    );
  });

  onBpmnElementHover(function (elementId) {
    let counter = elementCounters[elementId];
    if (counter) {
      showElementCounters(
        elementId,
        counter.active,
        counter.completed,
        counter.terminated
      );
    }
  });

  onBpmnElementOut(function (elementId) {
    if (elementId === markedBpmnElement || isElementCountersViewEnabled) {
      return;
    }

    let counter = elementCounters[elementId];
    if (counter) {
      removeElementCounters(elementId);
    }
  });

  onBpmnElementClick(function (elementId) {
    if (isElementCountersViewEnabled) {
      return;
    }

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
      showElementCounters(
        elementId,
        counter.active,
        counter.completed,
        counter.terminated
      );
    }
  });

  const showElementCountersButton = $(
    "#process-instance-show-element-counters"
  );
  const hideElementCountersButton = $(
    "#process-instance-hide-element-counters"
  );

  showElementCountersButton.click(function () {
    isElementCountersViewEnabled = true;
    showElementCountersButton.addClass("visually-hidden");
    hideElementCountersButton.removeClass("visually-hidden");

    showAllElementCounters(elementCounters);
  });
  hideElementCountersButton.click(function () {
    isElementCountersViewEnabled = false;
    hideElementCountersButton.addClass("visually-hidden");
    showElementCountersButton.removeClass("visually-hidden");

    for (const elementId of Object.keys(elementCounters)) {
      removeElementCounters(elementId);
    }
  });

  if (isElementCountersViewEnabled) {
    showAllElementCounters(elementCounters);
  }
}

function showAllElementCounters(elementCounters) {
  for (const [elementId, counter] of Object.entries(elementCounters)) {
    showElementCounters(
      elementId,
      counter.active,
      counter.completed,
      counter.terminated
    );
  }
}

function updateElementCounter(elementCounters, bpmnElement, updateCounter) {
  if (bpmnElement.bpmnElementType === "PROCESS") {
    return;
  }
  let elementId = bpmnElement.elementId;
  let counter = elementCounters[elementId];
  if (!counter) {
    counter = { active: 0, completed: 0, terminated: 0 };
  }
  updateCounter(counter);
  elementCounters[elementId] = counter;
}

function loadJobsOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryJobsByProcessInstance(processInstanceKey).done(function (response) {
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

      jobKeyToElementIdMapping[job.key] = elementId;

      let state = formatJobState(job.state);
      const isActiveJob = job.state === "ACTIVATABLE";

      let connectorButtonId = `action-connector-execute-${elementId}`;

      let actionButton = "";
      if (isActiveJob) {
        let fillModalAction = function (type) {
          return "fillJobModal('" + job.key + "', '" + type + "');";
        };

        actionButton =
          '<div class="btn-group">' +
          '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="modal" data-bs-target="#complete-job-modal" onclick="' +
          fillModalAction("complete") +
          '">' +
          '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>' +
          " Complete" +
          "</button>" +
          '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>' +
          '<ul class="dropdown-menu">' +
          '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#fail-job-modal" href="#" onclick="' +
          fillModalAction("fail") +
          '">' +
          '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>' +
          " Fail" +
          "</a></li>" +
          '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#throw-error-job-modal" href="#" onclick="' +
          fillModalAction("throw-error") +
          '">' +
          '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#lightning"/></svg>' +
          " Throw Error" +
          "</a></li>" +
          "</ul>" +
          "</div>";
      }

      $("#jobs-of-process-instance-table > tbody:last-child").append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          job.key +
          "</td>" +
          "<td>" +
          job.jobType +
          "</td>" +
          "<td>" +
          elementFormatted +
          "</td>" +
          "<td>" +
          job.elementInstance.key +
          "</td>" +
          "<td>" +
          state +
          "</td>" +
          "<td>" +
          actionButton +
          "</td>" +
          "</tr>"
      );

      if (isActiveJob) {
        // connector are handled differently
        if (isConnectorJob(job)) {
          makeConnectorTaskPlayable(elementId, job.key, job.jobType);

          $("#" + connectorButtonId).click(function () {
            executeConnectorJob(job.jobType, job.key);
          });
        } else {
          makeTaskPlayable(elementId, job.key);
        }
      }
    });

    removeTaskPlayableMarkersOfJobs(jobs);
  });
}

function isConnectorJob(job) {
  // assuming that a job for a connector starts with this prefix
  return job.jobType.startsWith("io.camunda:");
}

function removeTaskPlayableMarkersOfJobs(jobs) {
  let elementIdsOfActivatableJobs = jobs
    .filter(function (job) {
      return job.state === "ACTIVATABLE";
    })
    .map(function (job) {
      return job.elementInstance.element.elementId;
    });

  let elementIdsOfNotActivatableJobs = jobs
    .filter(function (job) {
      return job.state !== "ACTIVATABLE";
    })
    .map(function (job) {
      return job.elementInstance.element.elementId;
    });

  elementIdsOfNotActivatableJobs
    .filter(function (elementId) {
      return !elementIdsOfActivatableJobs.includes(elementId);
    })
    .forEach(function (elementId) {
      removeTaskPlayableMarker(elementId);
    });
}

function loadUserTasksOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryUserTasksByProcessInstance(processInstanceKey).done(function (response) {
    let processInstance = response.data.processInstance;
    let userTasks = processInstance.userTasks;

    let totalCount = userTasks.totalCount;
    let nodes = userTasks.nodes;

    // TODO (#67): show user tasks in tab

    nodes.forEach((userTask) => {
      const bpmnElement = userTask.elementInstance.element;
      const elementId = bpmnElement.elementId;

      jobKeyToElementIdMapping[userTask.key] = elementId;

      const isActiveTask = userTask.state === "CREATED";
      if (isActiveTask) {
        makeTaskPlayable(elementId, userTask.key, {
          isUserTask: true,
          taskForm: userTask.form?.resource,
        });
      }
    });

    removeUserTaskMarkers(nodes);
  });
}

function removeUserTaskMarkers(userTasks) {
  let elementIdsOfActiveTasks = userTasks
    .filter(function (userTask) {
      return userTask.state === "CREATED";
    })
    .map(function (userTask) {
      return userTask.elementInstance.element.elementId;
    });

  let elementIdsOfNotActiveTasks = userTasks
    .filter(function (userTask) {
      return userTask.state !== "CREATED";
    })
    .map(function (userTask) {
      return userTask.elementInstance.element.elementId;
    });

  elementIdsOfNotActiveTasks
    .filter(function (elementId) {
      return !elementIdsOfActiveTasks.includes(elementId);
    })
    .forEach(function (elementId) {
      removeTaskPlayableMarker(elementId);
    });
}

function loadIncidentsOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryIncidentsByProcessInstance(processInstanceKey).done(function (response) {
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

      let jobKey = "";
      if (incident.job) {
        jobKey = incident.job.key;
      }

      const action = "resolveIncident(" + incident.key + ", " + jobKey + ");";

      let actionButton = "";
      if (isActiveIncident) {
        actionButton =
          '<button type="button" class="btn btn-sm btn-primary" title="Resolve" onclick="' +
          action +
          '">' +
          '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#arrow-counterclockwise"/></svg>' +
          " Resolve" +
          "</button>";
      }

      $("#incidents-of-process-instance-table > tbody:last-child").append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          incident.key +
          "</td>" +
          "<td><code>" +
          incident.errorType +
          "</code></td>" +
          "<td>" +
          incident.errorMessage +
          "</td>" +
          "<td>" +
          elementFormatted +
          "</td>" +
          "<td>" +
          incident.elementInstance.key +
          "</td>" +
          "<td>" +
          state +
          "</td>" +
          "<td>" +
          actionButton +
          "</td>" +
          "</tr>"
      );

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
  const messageSubscriptionCollapseId =
    "message-subscription-" + messageSubscription.key;

  let correlatedMessagesFormatted =
    '<div class="row row-cols-1">' +
    '<div class="col">' +
    '<span class="badge bg-secondary">' +
    correlatedMessageCount +
    "</span>" +
    ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#' +
    messageSubscriptionCollapseId +
    '" aria-expanded="false" title="Show correlated messages">' +
    '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>' +
    "</button>" +
    "</div>";

  let processInstanceColumn = "";
  const isStartEventSubscription = !messageSubscription.elementInstance;
  if (isStartEventSubscription) {
    processInstanceColumn = "Process Instance Key";
  }

  let correlatedMessages =
    '<table class="table">' +
    "<thead>" +
    "<tr>" +
    '<th scope="col">Message Key</th>' +
    '<th scope="col">Correlation Time</th>' +
    '<th scope="col">' +
    processInstanceColumn +
    "</th>" +
    "<th></th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>";

  messageSubscription.messageCorrelations.forEach((messageCorrelation) => {
    const message = messageCorrelation.message;

    const fillModalAction = "fillMessageDetailsModal(" + message.key + ");";
    const actionButton =
      '<button type="button" class="btn btn-sm" data-bs-toggle="modal" data-bs-target="#message-detail-modal" title="Message details" onclick="' +
      fillModalAction +
      '">' +
      '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>' +
      "</button>";

    let processInstanceKeyFormatted = "";
    if (messageCorrelation.processInstance) {
      const processInstanceKey = messageCorrelation.processInstance.key;
      processInstanceKeyFormatted =
        '<a href="/view/process-instance/' +
        processInstanceKey +
        '">' +
        processInstanceKey +
        "</a>";
    }

    correlatedMessages +=
      "<tr>" +
      "<td>" +
      message.key +
      "</td>" +
      "<td>" +
      messageCorrelation.timestamp +
      "</td>" +
      "<td>" +
      processInstanceKeyFormatted +
      "</td>" +
      "<td>" +
      actionButton +
      "</td>" +
      "</tr>";
  });

  correlatedMessages += "</tbody></table>";
  correlatedMessagesFormatted +=
    '<div class="collapse" id="' +
    messageSubscriptionCollapseId +
    '">' +
    '<div class="col">' +
    correlatedMessages +
    "</div>" +
    "</div>" +
    "</div>";
  return correlatedMessagesFormatted;
}

function loadMessageSubscriptionsOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryMessageSubscriptionsByProcessInstance(processInstanceKey).done(function (
    response
  ) {
    let processInstance = response.data.processInstance;
    let messageSubscriptions = processInstance.messageSubscriptions;

    let totalCount = messageSubscriptions.length;

    $("#message-subscriptions-total-count").text(totalCount);

    $("#message-subscriptions-of-process-instance-table tbody").empty();

    const indexOffset = 1;

    messageSubscriptions.forEach((messageSubscription, index) => {
      let bpmnElement = messageSubscription.element;
      let elementFormatted = formatBpmnElementInstance(bpmnElement);
      const elementId = bpmnElement.elementId;

      let state = formatMessageSubscriptionState(messageSubscription.state);

      const isActiveMessageSubscription =
        messageSubscription.state === "CREATED" ||
        (messageSubscription.state === "CORRELATED" &&
          messageSubscription.elementInstance.state === "ACTIVATED");

      const fillModalAction =
        "fillPublishMessageModal('" +
        messageSubscription.messageName +
        "', '" +
        messageSubscription.messageCorrelationKey +
        "');";

      let actionButton = "";
      if (isActiveMessageSubscription) {
        actionButton =
          '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#publish-message-modal" title="Publish message" onclick="' +
          fillModalAction +
          '">' +
          '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>' +
          " Publish Message" +
          "</button>";
      }

      $(
        "#message-subscriptions-of-process-instance-table > tbody:last-child"
      ).append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          messageSubscription.key +
          "</td>" +
          "<td>" +
          messageSubscription.messageName +
          "</td>" +
          "<td><code>" +
          messageSubscription.messageCorrelationKey +
          "</code></td>" +
          "<td>" +
          elementFormatted +
          "</td>" +
          "<td>" +
          messageSubscription.elementInstance.key +
          "</td>" +
          "<td>" +
          state +
          "</td>" +
          "<td>" +
          formatCorrelatedMessages(messageSubscription) +
          "</td>" +
          "<td>" +
          actionButton +
          "</td>" +
          "</tr>"
      );

      if (isActiveMessageSubscription) {
        const clickAction =
          "publishMessage('" +
          messageSubscription.messageName +
          "', '" +
          messageSubscription.messageCorrelationKey +
          "');";
        addPublishMessageButton(elementId, clickAction, fillModalAction);
      } else {
        removePublishMessageButton(elementId);
      }
    });
  });
}

function loadTimersOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryTimersByProcessInstance(processInstanceKey).done(function (response) {
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

      const action =
        "timeTravel('" + timer.dueDate + "', '" + bpmnElement.elementId + "');";
      const fillModalAction =
        "fillTimeTravelModal('" +
        timer.dueDate +
        "', '" +
        bpmnElement.elementId +
        "');";

      let actionButton = "";
      if (isActiveTimer) {
        actionButton =
          '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#time-travel-modal" title="Time travel" onclick="' +
          fillModalAction +
          '">' +
          '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>' +
          " Time Travel" +
          "</button>";
      }

      $("#timers-of-process-instance-table > tbody:last-child").append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          timer.key +
          "</td>" +
          "<td>" +
          formatTimerRepetitions(timer) +
          "</td>" +
          "<td>" +
          timer.dueDate +
          "</td>" +
          "<td>" +
          elementFormatted +
          "</td>" +
          "<td>" +
          timer.elementInstance.key +
          "</td>" +
          "<td>" +
          state +
          "</td>" +
          "<td>" +
          actionButton +
          "</td>" +
          "</tr>"
      );

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

  queryChildInstancesByProcessInstance(processInstanceKey).done(function (
    response
  ) {
    let processInstance = response.data.processInstance;
    let childProcessInstances = processInstance.childProcessInstances;

    let totalCount = childProcessInstances.length;

    $("#child-instances-total-count").text(totalCount);

    $("#child-instances-of-process-instance-table tbody").empty();

    const indexOffset = 1;

    childProcessInstances.forEach((childInstance, index) => {
      const parentBpmnElement = childInstance.parentElementInstance.element;
      const elementFormatted = formatBpmnElementInstance(parentBpmnElement);
      const state = formatProcessInstanceState(childInstance);
      const hrefChildInstance = "/view/process-instance/" + childInstance.key;
      const childInstanceKeyFormatted =
        '<a href="' + hrefChildInstance + '">' + childInstance.key + "</a>";
      const childBpmnProcessId = childInstance.process.bpmnProcessId;

      $("#child-instances-of-process-instance-table > tbody:last-child").append(
        "<tr>" +
          "<td>" +
          (indexOffset + index) +
          "</td>" +
          "<td>" +
          childInstanceKeyFormatted +
          "</td>" +
          "<td>" +
          childBpmnProcessId +
          "</td>" +
          "<td>" +
          elementFormatted +
          "</td>" +
          "<td>" +
          childInstance.parentElementInstance.key +
          "</td>" +
          "<td>" +
          state +
          "</td>" +
          "</tr>"
      );

      const elementId = parentBpmnElement.elementId;
      addOpenChildInstanceButton(elementId, hrefChildInstance);
    });
  });
}

function loadParentInstanceOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryParentInstanceByProcessInstance(processInstanceKey).done(function (
    response
  ) {
    // remove all parent elements from nav before appending
    $(".parent-process-instance").remove();

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
      '<li class="breadcrumb-item parent-process-instance" aria-current="page">' +
        '<a href="/view/process-instance/' +
        parentProcessInstanceKey +
        '">' +
        parentProcessInstanceKey +
        "</a>" +
        ' <span class="text-muted">(' +
        parentBpmnProcessId +
        ")</span>" +
        "</li>"
    );

    appendParentProcessInstanceToNav(parentProcessInstance);
  }
}

function loadElementInfoOfProcessInstance() {
  const processInstanceKey = getProcessInstanceKey();

  queryElementInfosByProcessInstance(processInstanceKey).done(function (
    response
  ) {
    const processInstance = response.data.processInstance;
    const process = processInstance.process;
    const elements = process.elements;
    elements.forEach((element) => showInfoOfBpmnElement(element));
  });
}
