
function showBpmn(bpmnXML) {
  openDiagram(bpmnXML)
      .then(ok => {
        makeStartEventsPlayable();
      });
}

var bpmnViewer;
var canvas;
var elementRegistry;
var eventBus;
var overlays;

async function openDiagram(bpmnXML) {

  bpmnViewer = new BpmnJS({
    container: '#canvas',
    width: '100%',
    height: '100%'
  });

  canvas = bpmnViewer.get("canvas");
  elementRegistry = bpmnViewer.get("elementRegistry");
  eventBus = bpmnViewer.get("eventBus");
  overlays = bpmnViewer.get("overlays");

  // TODO (saig0): remove me - only for testing
  window.bpmnViewer = bpmnViewer;
  window.elementRegistry = elementRegistry;

  try {
    await bpmnViewer.importXML(bpmnXML);

    // zoom to fit full viewport
    canvas.zoom('fit-viewport');

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