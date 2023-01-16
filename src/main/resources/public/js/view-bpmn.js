
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
        && ['bpmn:Process', 'bpmn:Participant'].includes(element.parent.type)
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

function addPublishMessageButton(elementId, clickAction, fillModalAction) {

  const content = '<div class="btn-group">'
      + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Publish Message" onclick="' + clickAction + '">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#envelope"/></svg>'
      + '</button>'
      + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
      + '<ul class="dropdown-menu">'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#publish-message-modal" href="#" onclick="' + fillModalAction + '">with variables</a></li>'
      + '</ul>'
      + '</div>';

  overlays.add(elementId, 'publish-message', {
    position: {
      top: -20,
      left: -40
    },
    html: content
  });
}

function removePublishMessageButton(elementId) {
  overlays.remove({ element: elementId, type: 'publish-message' })
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

function removeBpmnElementMarkers(elementId) {
  canvas.removeMarker(elementId, 'bpmn-element-active');
  canvas.removeMarker(elementId, 'bpmn-element-incident');
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
  // remove existing overlay to avoid multiple overlays on reload
  removeElementCounters(elementId);

  let content = '<div style="width: 150px;"><small>';

  if (activeInstances > 0) {
    content += '<span class="badge bg-primary bg-opacity-75" title="active">'
        + '<svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#pause"/></svg>'
        + activeInstances + '</span>';
  }
  if (completedInstances > 0) {
    content += ' <span class="badge bg-secondary bg-opacity-75" title="completed">'
        + '<svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>'
        + completedInstances + '</span>';
  }
  if (terminatedInstances > 0) {
    content += ' <span class="badge bg-black bg-opacity-75" title="terminated">'
        + '<svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>'
        + terminatedInstances + '</span>';
  }

  content += '</small></div>';

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
  const formKey = getFormKeyForElement(elementId);

  let primaryAction = `completeJob(${jobKey}, '{}');`;
  if(formKey) {
    primaryAction = `showTaskModal(${jobKey})`;
  }

  let fillModalAction = function (type) {
    return 'fillJobModal(\'' + jobKey + '\', \'' + type + '\');';
  }

  const content = '<div class="btn-group">'
      + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Complete job" onclick="' + primaryAction + '">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>'
      + '</button>'
      + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
      + '<ul class="dropdown-menu">'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#complete-job-modal" href="#" onclick="' + fillModalAction('complete') + '">with variables</a></li>'
      + '<li><hr class="dropdown-divider"></li>'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#fail-job-modal" href="#" onclick="' + fillModalAction('fail') + '">'
      + '<svg class="bi" width="18" height="18" fill="black"><use xlink:href="/img/bootstrap-icons.svg#x"/></svg>' + ' Fail' + '</a></li>'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#throw-error-job-modal" href="#" onclick="' + fillModalAction('throw-error') + '">'
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

function addResolveIncidentButton(elementId, action) {

  const content = '<button type="button" class="btn btn-sm btn-primary" title="Resolve incident" onclick="'+ action + '">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#arrow-counterclockwise"/></svg>'
      + '</button>';

  overlays.add(elementId, 'resolve-incident', {
    position: {
      top: -20,
      left: -20
    },
    html: content
  });
}

function removeResolveIncidentButton(elementId) {
  overlays.remove({ element: elementId, type: 'resolve-incident' })
}

function addTimeTravelButton(elementId, action, fillAction) {

  const content = '<div class="btn-group">'
      + '<button type="button" class="btn btn-sm btn-primary overlay-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Time Travel" onclick="' + action + '">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#clock"/></svg>'
      + '</button>'
      + '<button type="button" class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button>'
      + '<ul class="dropdown-menu">'
      + '<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#time-travel-modal" href="#" onclick="' + fillAction + '">with time</a></li>'
      + '</ul>'
      + '</div>';

  overlays.add(elementId, 'time-travel', {
    position: {
      top: -20,
      left: -40
    },
    html: content
  });
}

function removeTimeTravelButton(elementId) {
  overlays.remove({ element: elementId, type: 'time-travel' })
}

function addOpenChildInstanceButton(elementId, href) {

  const content = '<a type="button" class="btn btn-sm btn-secondary" title="Open child instance" href="'+ href + '">'
      + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#zoom-in"/></svg>'
      + '</a>';

  overlays.add(elementId, 'open-child-instance', {
    position: {
      top: -20,
      right: 20
    },
    html: content
  });
}

function showElementInfo(elementId, bpmnElementType, info) {

  const infoId = "bpmn-element-info-" + elementId;
  let tooltipPlacement = 'bottom';

  let overlayPosition = {
    bottom: 5,
    right: 10
  }
  if (bpmnElementType === 'SEQUENCE_FLOW') {
    overlayPosition = {
      bottom: 0,
      right: 25
    }
  }
  if (bpmnElementType.includes('EVENT')) {
    overlayPosition = {
      top: -22,
      right: 10
    }
    tooltipPlacement = 'top';
  }

  let content = '<div id="' + infoId + '" data-bs-toggle="tooltip" data-bs-placement="' + tooltipPlacement + '" data-bs-html="true" data-bs-customClass="bpmn-element-info" title="'+ info + '">'
      + '<svg class="bi" width="18" height="18" fill="#007DFFB2"><use xlink:href="/img/bootstrap-icons.svg#info-circle-fill"/></svg>'
      + '</div>';

  overlays.add(elementId, 'element-info', {
    position: overlayPosition,
    html: content
  });

  new bootstrap.Tooltip($("#" + infoId), {
    boundary: document.body
  })
}

function toggleDetailsCollapse() {
  let windowHeight = $(window).height();
  let canvasElement = $("#canvas");
  let button = $("#details-collapse-button");
  let buttonImage = $("#details-collapse-button > svg > use");

  let canvasHeight;
  if (detailsCollapsed) {
    // initial state on loading
    canvasHeight = "400px";
    button.attr("title", "collapse");
    buttonImage.attr("href", "/img/bootstrap-icons.svg#arrow-bar-down");
    detailsCollapsed = false;

  } else {
    canvasHeight = windowHeight * 0.8;
    button.attr("title", "expand");
    buttonImage.attr("href", "/img/bootstrap-icons.svg#arrow-bar-up");
    detailsCollapsed = true;
  }

  canvasElement.height(canvasHeight);
}
