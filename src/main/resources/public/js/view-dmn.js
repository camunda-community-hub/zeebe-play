var dmnViewer;
var dmnCanvas;
var dmnOverlays;

function showDmn(dmnXml, decisionId, viewChangedHandler) {
  return openDmnDiagram(dmnXml, decisionId, viewChangedHandler);
}

async function openDmnDiagram(dmnXml, decisionId, viewChangedHandler) {
  dmnViewer = new DmnJS({
    container: "#canvas",
    width: "100%",
    height: "100%",
  });

  try {
    await dmnViewer.importXML(dmnXml);

    getDmnCanvas()?.zoom("fit-viewport");

    // switch to the decision
    const view = dmnViewer.getViews().find((view) => view.id === decisionId);
    await dmnViewer.open(view);

    dmnViewer.on("views.changed", (event) => viewChangedHandler(event));
  } catch (err) {
    console.error("could not import DMN diagram", err);
  }
}

function getDmnCanvas() {
  return dmnViewer.getActiveViewer()?.get("canvas");
}

function getDmnOverlays() {
  return dmnViewer.getActiveViewer()?.get("overlays");
}

function markDecisionAsEvaluated(decisionId) {
  getDmnOverlays()?.remove({ element: decisionId, type: "evaluation-state" });

  const content = `
    <div>
      <span class="badge bg-secondary bg-opacity-75" title="success">
        <svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>  
      </span>  
    </div>`;

  getDmnOverlays()?.add(decisionId, "evaluation-state", {
    position: {
      bottom: 0,
      left: 0,
    },
    html: content,
  });
}

function markDecisionAsFailed(decisionId) {
  getDmnOverlays()?.remove({ element: decisionId, type: "evaluation-state" });

  const content = `
    <div>
      <span class="badge bg-danger bg-opacity-75" title="failed">
        <svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#exclamation-triangle"/></svg>  
      </span>  
    </div>`;

  getDmnOverlays()?.add(decisionId, "evaluation-state", {
    position: {
      bottom: 0,
      left: 0,
    },
    html: content,
  });
}

function addDecisionCounters(decisionId, counters) {
  getDmnOverlays()?.remove({
    element: decisionId,
    type: "decision-evaluation-counter",
  });

  let countersFormatted = "";
  if (counters.success) {
    countersFormatted += `
      <span class="badge bg-secondary bg-opacity-75" title="success">
        <svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#check"/></svg>  
        ${counters.success}
      </span>`;
  }
  if (counters.failed) {
    countersFormatted += `
      <span class="badge bg-dark bg-opacity-75" title="failed">
        <svg class="bi" width="14" height="14" fill="white"><use xlink:href="/img/bootstrap-icons.svg#exclamation-triangle"/></svg>  
        ${counters.failed}
      </span>`;
  }

  const content = `<div style="width: 150px;">${countersFormatted}</div>`;

  getDmnOverlays()?.add(decisionId, "decision-evaluation-counter", {
    position: {
      bottom: 0,
      left: 0,
    },
    html: content,
  });
}
