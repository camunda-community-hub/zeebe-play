function showBpmn(bpmnXML) {
  return openDiagram(bpmnXML);
}

var bpmnViewer;
var canvas;
var elementRegistry;
var graphicsFactory;
var eventBus;
var overlays;

var highlightedElementId;

var detailsCollapsed = false;

async function openDiagram(bpmnXML) {
  bpmnViewer = new BpmnNavigatedViewer({
    container: "#canvas",
    width: "100%",
    height: "100%",
  });

  canvas = bpmnViewer.get("canvas");
  elementRegistry = bpmnViewer.get("elementRegistry");
  graphicsFactory = bpmnViewer.get("graphicsFactory");
  eventBus = bpmnViewer.get("eventBus");
  overlays = bpmnViewer.get("overlays");

  eventBus.on("canvas.viewbox.changed", ({ viewbox }) => {
    const { x, y, width, height } = viewbox;
    window.location.hash = `${Math.round(x)}:${Math.round(y)}:${Math.round(
      width
    )}:${Math.round(height)}`;
  });

  try {
    await bpmnViewer.importXML(bpmnXML);

    const hashSegments = window.location.hash?.split(":");
    if (hashSegments.length === 4) {
      // use location from url hash
      canvas.viewbox({
        x: parseInt(hashSegments[0].substring(1), 10),
        y: parseInt(hashSegments[1], 10),
        width: parseInt(hashSegments[2], 10),
        height: parseInt(hashSegments[3], 10),
      });
    } else {
      // zoom to fit full viewport
      canvas.zoom("fit-viewport");
      // scroll to include the button overlays
      canvas.scroll({ dx: 30 });
    }
  } catch (err) {
    console.error("could not import BPMN 2.0 diagram", err);
  }
}

function makeStartEventsPlayable() {
  let processStartEvents = elementRegistry.filter(function (element) {
    return (
      element.type == "bpmn:StartEvent" &&
      ["bpmn:Process", "bpmn:Participant"].includes(element.parent.type) &&
      !element.businessObject.eventDefinitions
    );
  });

  const content =
    '<div class="btn-group">' +
    '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="New Instance" onclick="createNewProcessInstance();">' +
    '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#play"/></svg>' +
    "</button>" +
    '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>' +
    '<ul class="dropdown-menu">' +
    '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#new-instance-modal" href="#">with variables</a></li>' +
    "</ul>" +
    "</div>";

  processStartEvents.forEach((element) => {
    overlays.add(element.id, {
      position: {
        top: -20,
        left: -40,
      },
      html: content,
    });
  });
}

function addPublishMessageButton(elementId, clickAction, fillModalAction) {
  const content =
    '<div class="btn-group">' +
    '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Publish Message" onclick="' +
    clickAction +
    '">' +
    '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>' +
    "</button>" +
    '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>' +
    '<ul class="dropdown-menu">' +
    '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#publish-message-modal" href="#" onclick="' +
    fillModalAction +
    '">with variables</a></li>' +
    "</ul>" +
    "</div>";

  overlays.add(elementId, "publish-message", {
    position: {
      top: -20,
      left: -40,
    },
    html: content,
  });
}

function removePublishMessageButton(elementId) {
  overlays.remove({ element: elementId, type: "publish-message" });
}

function highlightElement(elementId) {
  if (highlightedElementId && highlightedElementId !== elementId) {
    canvas.removeMarker(highlightedElementId, "bpmn-element-selected");
  }

  canvas.toggleMarker(elementId, "bpmn-element-selected");
  canvas.scrollToElement(elementId);

  highlightedElementId = elementId;
}

function markBpmnElementAsActive(elementId) {
  canvas.addMarker(elementId, "bpmn-element-active");
}

function markBpmnElementWithIncident(elementId) {
  canvas.addMarker(elementId, "bpmn-element-incident");
}

function removeBpmnElementMarkers(elementId) {
  canvas.removeMarker(elementId, "bpmn-element-active");
  canvas.removeMarker(elementId, "bpmn-element-incident");
}

function markSequenceFlow(flowId) {
  let element = elementRegistry.get(flowId);
  let gfx = elementRegistry.getGraphics(element);

  colorSequenceFlow(element, gfx, "#52b415");
}

function colorSequenceFlow(sequenceFlow, gfx, color) {
  let di = sequenceFlow.di;

  di.set("stroke", color);
  di.set("fill", color);

  graphicsFactory.update("connection", sequenceFlow, gfx);
}

function showElementCounters(
  elementId,
  activeInstances,
  completedInstances,
  terminatedInstances
) {
  // remove existing overlay to avoid multiple overlays on reload
  removeElementCounters(elementId);

  let content = '<div style="width: 150px;"><small>';

  if (activeInstances > 0) {
    content +=
      '<span class="badge bg-primary bg-opacity-75" title="active">' +
      '<svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#pause"/></svg>' +
      activeInstances +
      "</span>";
  }
  if (completedInstances > 0) {
    content +=
      ' <span class="badge bg-secondary bg-opacity-75" title="completed">' +
      '<svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>' +
      completedInstances +
      "</span>";
  }
  if (terminatedInstances > 0) {
    content +=
      ' <span class="badge bg-black bg-opacity-75" title="terminated">' +
      '<svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>' +
      terminatedInstances +
      "</span>";
  }

  content += "</small></div>";

  overlays.add(elementId, "element-counters", {
    position: {
      bottom: 0,
      left: 0,
    },
    html: content,
  });
}

function removeElementCounters(elementId) {
  overlays.remove({ element: elementId, type: "element-counters" });
}

function onBpmnElementHover(callback) {
  eventBus.on("element.hover", function (e) {
    let elementId = e.element.id;
    callback(elementId);
  });
}

function onBpmnElementOut(callback) {
  eventBus.on("element.out", function (e) {
    let elementId = e.element.id;
    callback(elementId);
  });
}

function onBpmnElementClick(callback) {
  eventBus.on("element.click", function (e) {
    let elementId = e.element.id;
    callback(elementId);
  });
}

function makeTaskPlayable(elementId, jobKey, { isUserTask, taskForm } = {}) {
  const fillModalAction = function (type) {
    return `fillJobModal("${jobKey}", "${type}");`;
  };

  const actions = [];

  if (taskForm) {
    actions.push({
      icon: `<img width="18" height="18" style="margin-top:-4px;" src="/img/edit-form.svg" />`,
      text: "Fill form",
      action: `showTaskModal(${jobKey}, "${elementId}")`,
    });
  }

  const cachedResponse = localStorage.getItem(
    "jobCompletion " + getBpmnProcessId() + " " + elementId
  );
  const hasCachedResponse =
    cachedResponse && Object.keys(JSON.parse(cachedResponse)).length > 0;

  if (!taskForm && hasCachedResponse) {
    actions.push({
      icon: '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#filetype-json"/></svg>',
      text: "Use previous response",
      action: `showJobCompleteModal(${jobKey}, "complete", ${JSON.stringify(
        cachedResponse
      )})`,
    });
  }

  if (isUserTask || !hasCachedResponse) {
    actions.push({
      icon: '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>',
      text: "Complete Job",
      action: `completeJob(${jobKey}, "{}");`,
    });
  }

  if (!taskForm && !hasCachedResponse) {
    actions.push({
      icon: '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#filetype-json"/></svg>',
      text: "Complete with variables",
      modalTarget: "#complete-job-modal",
      action: fillModalAction("complete"),
    });

    if (!isUserTask) {
      actions.push(
        {} // DIVIDER
      );
    }
  }

  if (!isUserTask) {
    actions.push({
      icon: '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>',
      text: "Fail",
      modalTarget: "#fail-job-modal",
      action: fillModalAction("fail"),
    });
  }

  let buttonId = `complete-job-button-${jobKey}`;

  let content = `
    <div class="btn-group">
      <button id="${buttonId}" type="button" class="btn btn-sm btn-primary overlay-button" 
        data-bs-toggle="tooltip" data-bs-placement="bottom" 
        title="${actions[0].text}" onclick='${actions[0].action}'>
        ${actions[0].icon} 
      </button>`;

  if (actions.length > 1) {
    // add a dropdown
    content +=
      '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>' +
      '<ul class="dropdown-menu">';

    content += actions
      .map(({ icon, text, action, modalTarget }, idx) => {
        if (idx === 0) {
          return "";
        } // first item is already the default button
        if (!action) {
          return '<li><hr class="dropdown-divider"></li>';
        }

        if (modalTarget) {
          return `<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="${modalTarget}" href="#" onclick='${action}'>${icon} ${text}</a></li>`;
        }

        return `<li><a class="dropdown-item" href="#" onclick='${action}'>${icon} ${text}</a></li>`;
      })
      .join("");

    content += "</ul>";
  }

  content += "</div>";

  let overlayType = isUserTask ? "user-task-action" : "job-action";
  overlays.add(elementId, overlayType, {
    position: {
      top: -20,
      left: -40,
    },
    html: content,
  });

  const buttonElement = $("#" + buttonId);
  buttonElement.tooltip();

  // We have to remove the tooltip manually when removing the element that triggers it
  // see https://github.com/twbs/bootstrap/issues/3084#issuecomment-5207780
  buttonElement.on("click", () => {
    $(`[data-bs-toggle="tooltip"]`).tooltip("hide");
  });
}

function makeConnectorTaskPlayable(elementId, jobKey, jobType) {
  let connectorButtonId = `connector-execute-${jobKey}`;
  let completeButtonId = `connector-complete-${jobKey}`;

  let content = `
    <div class="btn-group">
      <button id="${connectorButtonId}" type="button"
              class="btn btn-sm btn-primary overlay-button" title="Invoke connector">
        <svg class="bi" width="18" height="18" fill="white">
          <use xlink:href="/img/bootstrap-icons.svg#plugin"/>
        </svg>
      </button>
      <button type="button"
              class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split"
              data-bs-toggle="dropdown" aria-expanded="false"><span
          class="visually-hidden">Toggle Dropdown</span></button>
      <ul class="dropdown-menu">
        <li>
          <a id="${completeButtonId}" class="dropdown-item" href="#">
            <svg class="bi" width="18" height="18" fill="black">
              <use xlink:href="/img/bootstrap-icons.svg#check"/>
            </svg>
            Complete
          </a>
        </li>
      </ul>
    </div>`;

  overlays.add(elementId, "connector-action", {
    position: {
      top: -20,
      left: -40,
    },
    html: content,
  });

  const connectorButtonElement = $("#" + connectorButtonId);
  connectorButtonElement.click(function () {
    executeConnectorJob(jobType, jobKey);
  });

  connectorButtonElement.tooltip();

  // We have to remove the tooltip manually when removing the element that triggers it
  // see https://github.com/twbs/bootstrap/issues/3084#issuecomment-5207780
  connectorButtonElement.on("click", () => {
    $(`[data-bs-toggle="tooltip"]`).tooltip("hide");
  });

  $("#" + completeButtonId).click(function () {
    const cachedResponse = localStorage.getItem(
      "jobCompletion " + getBpmnProcessId() + " " + elementId
    );
    let jobVariables = cachedResponse;
    if (!cachedResponse) {
      jobVariables = "";
    }
    showJobCompleteModal(jobKey, "complete", jobVariables);

    $(`[data-bs-toggle="tooltip"]`).tooltip("hide");
  });
}

function makeErrorEventPlayable(elementId, jobKey, errorCode) {
  let buttonId = `throw-error-${jobKey}-${errorCode}`;

  let content = `
    <button id="${buttonId}" type="button"
              class="btn btn-sm btn-primary" title="Throw error">
        <svg class="bi" width="18" height="18" fill="white">
          <use xlink:href="/img/bootstrap-icons.svg#lightning"/>
        </svg>
      </button>`;

  overlays.add(elementId, "error-event-action", {
    position: {
      top: -20,
      left: -20,
    },
    html: content,
  });

  const buttonElement = $("#" + buttonId);
  buttonElement.click(function () {
    showThrowErrorModal(jobKey, errorCode);
  });

  buttonElement.tooltip();

  buttonElement.on("click", () => {
    $(`[data-bs-toggle="tooltip"]`).tooltip("hide");
  });
}

function removeAllUserTaskActionMarkers() {
  overlays.remove({ type: "user-task-action" });
}

function removeAllJobActionMarkers() {
  overlays.remove({ type: "job-action" });
}

function removeAllConnectorActionMarkers() {
  overlays.remove({ type: "connector-action" });
}

function removeAllThrowErrorActionMarkers() {
  overlays.remove({ type: "error-event-action" });
}

function addResolveIncidentButton(elementId, action) {
  const content =
    '<button type="button" class="btn btn-sm btn-primary" title="Resolve incident" onclick="' +
    action +
    '">' +
    '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#arrow-counterclockwise"/></svg>' +
    "</button>";

  overlays.add(elementId, "resolve-incident", {
    position: {
      top: -20,
      left: -20,
    },
    html: content,
  });
}

function removeResolveIncidentButton(elementId) {
  overlays.remove({ element: elementId, type: "resolve-incident" });
}

function addTimeTravelButton(elementId, action, fillAction) {
  const content =
    '<div class="btn-group">' +
    '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Time Travel" onclick="' +
    action +
    '">' +
    '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>' +
    "</button>" +
    '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>' +
    '<ul class="dropdown-menu">' +
    '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#time-travel-modal" href="#" onclick="' +
    fillAction +
    '">with time</a></li>' +
    "</ul>" +
    "</div>";

  overlays.add(elementId, "time-travel", {
    position: {
      top: -20,
      left: -40,
    },
    html: content,
  });
}

function removeTimeTravelButton(elementId) {
  overlays.remove({ element: elementId, type: "time-travel" });
}

function addOpenChildInstanceButton(elementId, href) {
  const content =
    '<a type="button" class="btn btn-sm btn-secondary" title="Open child instance" href="' +
    href +
    '">' +
    '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#zoom-in"/></svg>' +
    "</a>";

  overlays.add(elementId, "open-child-instance", {
    position: {
      top: -20,
      right: 20,
    },
    html: content,
  });
}

function addOpenDecisionEvaluationButton(elementId, href) {
  overlays.remove({ element: elementId, type: "open-decision-evaluation" });

  const content = `
      <a type="button" class="btn btn-sm btn-secondary" title="Open decision evaluation" href="${href}">
        <svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#zoom-in"/></svg>
      </a>`;

  overlays.add(elementId, "open-decision-evaluation", {
    position: {
      top: -20,
      right: 20,
    },
    html: content,
  });
}

function showElementInfo(elementId, bpmnElementType, info) {
  const infoId = "bpmn-element-info-" + elementId;
  let tooltipPlacement = "bottom";

  let overlayPosition = {
    bottom: 5,
    right: 10,
  };
  if (bpmnElementType === "SEQUENCE_FLOW") {
    overlayPosition = {
      bottom: 0,
      right: 25,
    };
  }
  if (bpmnElementType.includes("EVENT")) {
    overlayPosition = {
      top: -22,
      right: 10,
    };
    tooltipPlacement = "top";
  }

  let content =
    '<div id="' +
    infoId +
    '" data-bs-toggle="tooltip" data-bs-placement="' +
    tooltipPlacement +
    '" data-bs-html="true" data-bs-customClass="bpmn-element-info" class="info-icon" title="' +
    info +
    '">i</div>';

  overlays.add(elementId, "element-info", {
    position: overlayPosition,
    html: content,
  });

  new bootstrap.Tooltip($("#" + infoId), {
    boundary: document.body,
  });
}

function toggleDetailsCollapse() {
  let button = $("#details-collapse-button");
  let buttonImage = $("#details-collapse-button > svg > use");

  if (detailsCollapsed) {
    // initial state on loading
    button.attr("title", "collapse");
    buttonImage.attr("href", "/img/bootstrap-icons.svg#chevron-down");
    detailsCollapsed = false;
  } else {
    button.attr("title", "expand");
    buttonImage.attr("href", "/img/bootstrap-icons.svg#chevron-up");
    detailsCollapsed = true;
  }

  const tabElement = document.querySelector(".details-container .tab-content");
  if (detailsCollapsed) {
    tabElement?.classList.add("collapsed");
  } else {
    tabElement?.classList.remove("collapsed");
  }
}

function zoomIn() {
  bpmnViewer.get("zoomScroll").stepZoom(0.1);
}

function zoomOut() {
  bpmnViewer.get("zoomScroll").stepZoom(-0.1);
}

function resetViewport() {
  const outerViewbox = canvas.viewbox().outer;
  canvas.viewbox({
    x: 0,
    y: 0,
    width: outerViewbox.width,
    height: outerViewbox.height,
  });
}

function enterFullscreen() {
  const button = document.querySelector("#toggleFullscreenButton");

  $(button).tooltip("hide");

  button.setAttribute("title", "Disable fullscreen");
  button.innerHTML =
    '<img src="/img/DisableFullscreen.svg" width="14" height="14" />';
  button.onclick = exitFullscreen;

  new bootstrap.Tooltip(button, {
    boundary: document.body,
  });

  document.documentElement.requestFullscreen();
}

function exitFullscreen() {
  const button = document.querySelector("#toggleFullscreenButton");

  $(button).tooltip("hide");

  button.setAttribute("title", "Enable fullscreen");
  button.innerHTML =
    '<img src="/img/EnableFullscreen.svg" width="14" height="14" />';
  button.onclick = enterFullscreen;

  new bootstrap.Tooltip(button, {
    boundary: document.body,
  });

  document.exitFullscreen();
}
