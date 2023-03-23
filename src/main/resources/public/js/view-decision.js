const evaluationsOfDecisionPerPage = 5;
let evaluationsOfDecisionCurrentPage = 0;

var dmnViewIsLoaded = false;

let drgOfDecision;
let currentDecisionKey;

function getDecisionKey() {
  return $("#decision-page-key").text();
}

function loadDecisionView() {
  const decisionKey = getDecisionKey();
  currentDecisionKey = decisionKey;

  queryDecision(decisionKey).done(function (response) {
    let decision = response.data.decision;
    drgOfDecision = decision.decisionRequirements;

    $("#nav-decision").text(decision.decisionName);

    $("#details-deployment-time").html(
      formatTime(decision.decisionRequirements?.deployTime)
    );

    if (!dmnViewIsLoaded) {
      const dmnXML = decision.decisionRequirements?.dmnXML;
      if (dmnXML) {
        showDmn(dmnXML, decision.decisionId, onDecisionViewChanged).then(
          (ok) => {
            // okay
          }
        );
      }

      dmnViewIsLoaded = true;
    }

    loadEvaluationsOfDecision(evaluationsOfDecisionCurrentPage);
  });
}

function loadEvaluationsOfDecision(currentPage) {
  evaluationsOfDecisionCurrentPage = currentPage;

  queryEvaluationsByDecision(
    currentDecisionKey,
    evaluationsOfDecisionPerPage,
    evaluationsOfDecisionCurrentPage
  ).done(function (response) {
    let decision = response.data.decision;
    $("#evaluations-success").text(decision.successfulEvaluations.totalCount);
    $("#evaluations-failed").text(decision.failedEvaluations.totalCount);

    let evaluations = decision.evaluations;
    let totalCount = evaluations.totalCount;

    $("#evaluations-total-count").text(totalCount);

    $("#evaluations-of-decision-table tbody").empty();

    const indexOffset =
      evaluationsOfDecisionCurrentPage * evaluationsOfDecisionPerPage + 1;

    evaluations.nodes.forEach((evaluation, index) => {
      const state = formatDecisionEvaluationState(evaluation);

      let processInstanceRef = "";
      if (evaluation.processInstance) {
        const processInstance = evaluation.processInstance;
        processInstanceRef = `<a href="/view/process-instance/${processInstance.key}">
              ${processInstance.process.bpmnProcessId}</a>`;
      }

      $("#evaluations-of-decision-table tbody:last-child").append(`
        <tr>
          <td>${indexOffset + index}</td>
          <td>
            <a href="/view/decision-evaluation/${evaluation.key}">
              ${evaluation.key}</a>
          </td>
          <td>
            <code>${evaluation.decisionOutput}</code>
          </td>          
          <td>${processInstanceRef}</td>
          <td>${evaluation.evaluationTime}</td>
          <td>${state}</td>
        </tr>`);
    });

    updateEvaluationsOfDecisionPagination(totalCount);
  });
}

function onDecisionViewChanged(event) {
  // update the diagram based on the active view
  let id = event.activeView.id;
  let activeDecision = drgOfDecision.decisions.find(
    (decision) => decision.decisionId === id
  );
  if (activeDecision) {
    // update the details
    updateDecisionEvaluationDetails(activeDecision);

    $("#nav-decision").text(activeDecision.decisionName);

    // show decision evaluations tab
    $("#decision-evaluations-tab").removeClass("visually-hidden");

    // update decisionevaluations
    currentDecisionKey = activeDecision.key;
    loadEvaluationsOfDecisionFirst();
  }

  if (event.activeView.type === "drd") {
    $("#details-decision-label-key").text("DRD Key");
    $("#details-decision-key").text(drgOfDecision.key);

    $("#details-decision-label-id").text("DRD Id");
    $("#details-decision-id").text(drgOfDecision.decisionRequirementsId);

    $("#details-decision-label-name").text("DRD Name");
    $("#details-decision-name").text(drgOfDecision.decisionRequirementsName);

    $("#details-decision-label-version").text("DRD Version");
    $("#details-decision-version").text(drgOfDecision.version);

    $("#nav-decision").text(drgOfDecision.decisionRequirementsName);

    drgOfDecision.decisions.forEach((decision) => {
      addDecisionCounters(decision.decisionId, {
        success: decision.successfulEvaluations.totalCount,
        failed: decision.failedEvaluations.totalCount,
      });
    });

    // hide decision evaluations tab
    $("#decision-evaluations-tab").addClass("visually-hidden");

    // hide DRD box
    $(".dmn-definitions").each(function () {
      $(this).addClass("visually-hidden");
    });
  }
}

function updateEvaluationsOfDecisionPagination(totalCount) {
  updatePagination(
    "evaluations-of-decision",
    evaluationsOfDecisionPerPage,
    evaluationsOfDecisionCurrentPage,
    totalCount
  );
}

function loadEvaluationsOfDecisionFirst() {
  loadEvaluationsOfDecision(0);
}

function loadEvaluationsOfDecisionPrevious() {
  loadEvaluationsOfDecision(evaluationsOfDecisionCurrentPage - 1);
}

function loadEvaluationsOfDecisionNext() {
  loadEvaluationsOfDecision(evaluationsOfDecisionCurrentPage + 1);
}

function loadEvaluationsOfDecisionLast() {
  let last = $("#evaluations-of-decision-pagination-last").text() - 1;
  loadEvaluationsOfDecision(last);
}
