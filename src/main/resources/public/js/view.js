const processesPerPage = 20;
let processesCurrentPage = 0;

function loadProcessesView() {
  loadProcesses(0);
}

function loadProcesses(currentPage) {

  processesCurrentPage = currentPage;

  queryProcesses(processesPerPage, processesCurrentPage)
      .then(processes => {
        let totalCount = processes.totalCount;

        $("#processes-totalCount").text(totalCount);

        $("#processes-table tbody").empty();

        const indexOffset = processesCurrentPage * processesPerPage + 1;

        processes.nodes.forEach((node, index) => {
          $("#processes-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process/' + node.key + '">' + node.key + '</a>'
              + '</td>'
              + '<td>' + node.bpmnProcessId +'</td>'
              + '<td>' + node.version +'</td>'
              + '<td>' + node.deployTime +'</td>'
              + '<td>'
              + '<span class="badge bg-primary">' + node.activeInstances.totalCount + '</span> / '
              + '<span class="badge bg-secondary">' + node.completedInstances.totalCount + '</span> / '
              + '<span class="badge bg-secondary">' + node.terminatedInstances.totalCount + '</span>'
              +'</td>'
              + '</tr>');
        });

        updateProcessesPagination(totalCount);
      });
}

function updateProcessesPagination(totalCount) {

  let previousButton = $("#processes-pagination-previous-button");
  let first = $("#processes-pagination-first");
  let firstGap = $("#processes-pagination-first-gap");
  let previous = $("#processes-pagination-previous");
  let current = $("#processes-pagination-current");
  let next = $("#processes-pagination-next");
  let lastGap = $("#processes-pagination-last-gap");
  let last = $("#processes-pagination-last");
  let nextButton = $("#processes-pagination-next-button");

  // first.text(1);
  previous.text(processesCurrentPage - 1 + 1);
  current.text(processesCurrentPage + 1);
  next.text(processesCurrentPage + 1 + 1);

  let lastPage = Math.trunc(totalCount / processesPerPage);

  if (totalCount % processesPerPage == 0) {
    lastPage = lastPage - 1;
  }
  last.text(lastPage + 1);

  if (processesCurrentPage < 3) {
    firstGap.addClass("d-none");
  } else {
    firstGap.removeClass("d-none");
  }

  if (processesCurrentPage < 2) {
    first.addClass("d-none");
  } else {
    first.removeClass("d-none");
  }

  if (processesCurrentPage < 1) {
    previous.addClass("d-none");
    previousButton.addClass("disabled");
  } else {
    previous.removeClass("d-none");
    previousButton.removeClass("disabled");
  }

  if (processesCurrentPage > lastPage - 3) {
    lastGap.addClass("d-none");
  } else {
    lastGap.removeClass("d-none");
  }

  if (processesCurrentPage > lastPage - 2) {
    last.addClass("d-none");
  } else {
    last.removeClass("d-none");
  }

  if (processesCurrentPage > lastPage - 1) {
    next.addClass("d-none");
    nextButton.addClass("disabled");
  } else {
    next.removeClass("d-none");
    nextButton.removeClass("disabled");
  }
}

function loadProcessesFirst() {
  loadProcesses(0);
}

function loadProcessesPrevious() {
  loadProcesses(processesCurrentPage - 1);
}

function loadProcessesNext() {
  loadProcesses(processesCurrentPage + 1);
}
function loadProcessesLast() {
  let last = $("#processes-pagination-last").text() - 1;
  loadProcesses(last);
}

function loadProcessView() {
  const processKey = $("#process-page-key").text();

  queryProcess(processKey)
      .then(process => {
        $("#process-key").text(process.key);
        $("#bpmnProcessId").text(process.bpmnProcessId);
        $("#process-version").text(process.version);
        $("#process-deployment-time").text(process.deployTime);

        const bpmnXML = process.bpmnXML;
        showBpmn(bpmnXML);
      });
}

function showBpmn(bpmnXML) {
  var bpmnViewer = new BpmnJS({
    container: '#canvas'
  });

  async function openDiagram(bpmnXML) {

    try {
      await bpmnViewer.importXML(bpmnXML);

      // access viewer components
      var canvas = bpmnViewer.get('canvas');
      var overlays = bpmnViewer.get('overlays');


      // zoom to fit full viewport
      canvas.zoom('fit-viewport');

      /*
      // attach an overlay to a node
      overlays.add('SCAN_OK', 'note', {
        position: {
          bottom: 0,
          right: 0
        },
        html: '<div class="diagram-note">Mixed up the labels?</div>'
      });

      // add marker
      canvas.addMarker('SCAN_OK', 'needs-discussion');
      */
    } catch (err) {
      console.error('could not import BPMN 2.0 diagram', err);
    }
  }

  openDiagram(bpmnXML);
}