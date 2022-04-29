
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

async function openDiagram(bpmnXML) {

  bpmnViewer = new BpmnJS({
    container: '#canvas',
    width: '100%',
    height: '100%'
  });

  canvas = bpmnViewer.get("canvas");
  elementRegistry = bpmnViewer.get("elementRegistry");
  graphicsFactory = bpmnViewer.get('graphicsFactory');
  eventBus = bpmnViewer.get("eventBus");
  overlays = bpmnViewer.get("overlays");

  // TODO (saig0): remove me - only for testing
  window.bpmnViewer = bpmnViewer;
  window.elementRegistry = elementRegistry;

  try {
    await bpmnViewer.importXML(bpmnXML);

    // zoom to fit full viewport
    canvas.zoom('fit-viewport');
    // scroll to include the button overlays
    canvas.scroll({dx: 30});

  } catch (err) {
    console.error('could not import BPMN 2.0 diagram', err);
  }
}

function makeStartEventsPlayable() {

  let processStartEvents = elementRegistry.filter(function (element) {
    return element.type == 'bpmn:StartEvent'
        && element.parent.type == 'bpmn:Process'
        && !element.businessObject.eventDefinitions;
  });

  const content = '<div class="btn-group">'
      + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="New Instance" onclick="createNewProcessInstance();">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#play"/></svg>'
      + '</button>'
      + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
      + '<ul class="dropdown-menu">'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#new-instance-modal" href="#">with variables</a></li>'
      + '</ul>'
      + '</div>';

  processStartEvents.forEach(element => {
    overlays.add(element.id, {
      position: {
        top: -20,
        left: -40
      },
      html: content
    });

  });

}

function makeMessageStartEventsPlayable() {

  let messageStartEvents = elementRegistry.filter(function (element) {
    return element.type == 'bpmn:StartEvent'
        && element.businessObject.eventDefinitions
        && element.businessObject.eventDefinitions.find(function (eventDefinition) {
          return eventDefinition.$type == 'bpmn:MessageEventDefinition'
              && eventDefinition.messageRef
              && eventDefinition.messageRef.name;
        });
  });

  messageStartEvents.forEach(element => {

    let eventDefinition = element.businessObject.eventDefinitions[0];
    let messageName = eventDefinition.messageRef.name;

    const content = '<div class="btn-group">'
        + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Publish Message" onclick="publishMessage(\'' + messageName + '\');">'
        + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>'
        + '</button>'
        + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
        + '<ul class="dropdown-menu">'
        + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#publish-message-modal" href="#" onclick="fillPublishMessageModal(\'' + messageName  + '\');">with variables</a></li>'
        + '</ul>'
        + '</div>';

    overlays.add(element.id, {
      position: {
        top: -20,
        left: -40
      },
      html: content
    });

  });

}

function makeTimerStartEventsPlayable() {

  let timerStartEvents = elementRegistry.filter(function (element) {
    return element.type == 'bpmn:StartEvent'
        && element.businessObject.eventDefinitions
        && element.businessObject.eventDefinitions.find(function (eventDefinition) {
          return eventDefinition.$type == 'bpmn:TimerEventDefinition'
              && (eventDefinition.timeCycle || eventDefinition.timeDate);
        });
  });

  timerStartEvents.forEach(element => {

    let eventDefinition = element.businessObject.eventDefinitions[0];
    let timeCycle = eventDefinition.timeCycle;
    let timeDate = eventDefinition.timeDate;

    let timeDefinition;
    if (timeCycle) {
      timeDefinition = timeCycle.body;
    }
    if (timeDate) {
      timeDefinition = timeDate.body;
    }

    const content = '<div class="btn-group">'
        + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Time Travel" onclick="timeTravel(\'' + timeDefinition + '\');">'
        + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>'
        + '</button>'
        + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
        + '<ul class="dropdown-menu">'
        + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#time-travel-modal" href="#" onclick="fillTimeTravelModal(\'' + timeDefinition  + '\');">with time</a></li>'
        + '</ul>'
        + '</div>';

    overlays.add(element.id, {
      position: {
        top: -20,
        left: -40
      },
      html: content
    });

  });

}

function highlightElement(elementId) {
  if (highlightedElementId && highlightedElementId !== elementId) {
    canvas.removeMarker(highlightedElementId, 'bpmn-element-selected');
  }

  canvas.toggleMarker(elementId, 'bpmn-element-selected');
  canvas.scrollToElement(elementId);

  highlightedElementId = elementId;
}

function markBpmnElementAsActive(elementId) {
  canvas.addMarker(elementId, 'bpmn-element-active');
}

function markBpmnElementWithIncident(elementId) {
  canvas.addMarker(elementId, 'bpmn-element-incident');
}

function markSequenceFlow(flowId) {
  let element = elementRegistry.get(flowId);
  let gfx = elementRegistry.getGraphics(element);

  colorSequenceFlow(element, gfx, '#52b415');
}

function colorSequenceFlow(sequenceFlow, gfx, color) {
  let di = sequenceFlow.di;

  di.set('stroke', color);
  di.set('fill', color);

  graphicsFactory.update('connection', sequenceFlow, gfx);
}

function showElementCounters(elementId, activeInstances, completedInstances, terminatedInstances) {
  let content = '<div style="width: 70px;"><small>'
      + '<span class="badge bg-primary bg-opacity-75" title="active">' + activeInstances + '</span>'
      + ' <span class="badge bg-secondary bg-opacity-75" title="completed">' + completedInstances + '</span>'
      + ' <span class="badge bg-black bg-opacity-75" title="terminated">' + terminatedInstances + '</span>'
      + '</small></div>';

  overlays.add(elementId, 'element-counters', {
    position: {
      bottom: 0,
      left: 0
    },
    html: content
  });
}

function removeElementCounters(elementId) {
  overlays.remove({ element: elementId, type: 'element-counters' });
}

function onBpmnElementHover(callback) {
  eventBus.on("element.hover", function(e) {
    let elementId = e.element.id;
    callback(elementId);
  });
}

function onBpmnElementOut(callback) {
  eventBus.on("element.out", function(e) {
    let elementId = e.element.id;
    callback(elementId);
  });
}

function onBpmnElementClick(callback) {
  eventBus.on("element.click", function(e) {
    let elementId = e.element.id;
    callback(elementId);
  });
}

function makeTaskPlayable(elementId, jobKey) {

  const completeJob = "completeJob(" + jobKey + ", '{}');";
  const fillModalAction = 'fillJobModal(\'' + jobKey + '\');';

  const content = '<div class="btn-group">'
      + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Complete job" onclick="' + completeJob + '">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>'
      + '</button>'
      + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
      + '<ul class="dropdown-menu">'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#complete-job-modal" href="#" onclick="' + fillModalAction + '">with variables</a></li>'
      + '<li><hr class="dropdown-divider"></li>'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#job-fail-modal" href="#" onclick="' + fillModalAction + '">'
      + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>' + ' Fail' + '</a></li>'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#job-throw-error-modal" href="#" onclick="' + fillModalAction + '">'
      + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#lightning"/></svg>' + ' Throw Error' + '</a></li>'
      + '</ul>'
      + '</div>';

  overlays.add(elementId, 'job-marker', {
    position: {
      top: -20,
      left: -40
    },
    html: content
  });
}

function removeTaskPlayableMarker(elementId) {
  overlays.remove({ element: elementId, type: 'job-marker' })
}