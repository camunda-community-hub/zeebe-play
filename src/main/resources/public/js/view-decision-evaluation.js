var dmnViewIsLoaded = false;

let decisionEvaluation;
let drg;
let evaluatedDecisions = [];

function getDecisionEvaluationKey() {
  return $("#decision-evaluation-page-key").text();
}

function loadDecisionEvaluationView() {
  const decisionEvaluationKey = getDecisionEvaluationKey();

  queryDecisionEvaluation(decisionEvaluationKey).done(function (response) {
    decisionEvaluation = response.data.decisionEvaluation;
    let rootDecision = decisionEvaluation.decision;

    drg = rootDecision.decisionRequirements;
    evaluatedDecisions = decisionEvaluation.evaluatedDecisions;

    $("#nav-decision-name").html(`
      <a href="/view/decision/${rootDecision.key}">
        ${rootDecision.decisionName}
      </a>`);
    $("#details-state").html(formatDecisionEvaluationState(decisionEvaluation));

    updateDecisionEvaluationDetails(rootDecision);
    $("#details-evaluation-time").html(
      formatTime(decisionEvaluation.evaluationTime)
    );

    if (decisionEvaluation.processInstance) {
      const processInstance = decisionEvaluation.processInstance;

      $("#nav-decision-calling-process-instance")?.remove();

      $("#decision-evaluation-breadcrumb > ol:first-child").prepend(`
        <li class="breadcrumb-item" aria-current="page" id="nav-decision-calling-process-instance">
          <a href="/view/process-instance/${processInstance.key}">
            ${processInstance.process.bpmnProcessId}
          </a>
        </li>
      `);
    }

    if (decisionEvaluation.evaluationFailureMessage) {
      $("#decision-evaluation-failure-message").html(`
        <div class="alert alert-danger" role="alert">
          ${decisionEvaluation.evaluationFailureMessage}
        </div>`);
    }

    if (!dmnViewIsLoaded) {
      const dmnXML = drg?.dmnXML;
      if (dmnXML) {
        showDmn(
          dmnXML,
          rootDecision.decisionId,
          onDecisionEvaluationViewChanged
        ).then((ok) => {
          // okay
        });
      }

      dmnViewIsLoaded = true;
    }
  });
}

function onDecisionEvaluationViewChanged(event) {
  // reset data
  $("#decision-output").text("");
  $("#decision-inputs").empty();
  $(".dmn-row-highlighted").each(function () {
    $(this).removeClass("dmn-row-highlighted");
  });

  // update the diagram based on the active view
  let id = event.activeView.id;

  let currentDecision = drg.decisions.find(
    (decision) => decision.decisionId === id
  );
  if (currentDecision) {
    // update the details of decision
    updateDecisionEvaluationDetails(currentDecision);
  }

  let currentEvaluatedDecision = evaluatedDecisions.find(
    (d) => d.decision.decisionId === id
  );
  if (currentEvaluatedDecision) {
    // update decision output
    $("#decision-output").text(currentEvaluatedDecision.decisionOutput);

    // update decision input
    currentEvaluatedDecision.inputs?.forEach((input) => {
      $("#decision-inputs").append(`
        <div class="detail-entry">
          <b>${input.inputName}</b>
          <span>${input.value}</span>
        </div>`);
    });

    // mark matched rules
    currentEvaluatedDecision.matchedRules?.forEach((rule) => {
      let ruleIndex = rule.ruleIndex - 1;
      $(".tjs-table tbody tr")[ruleIndex].classList.add("dmn-row-highlighted");
    });
  }

  if (event.activeView.type === "decisionTable") {
    $("#button-decision-inputs").removeClass("visually-hidden");
    $("#button-decision-output").removeClass("visually-hidden");
  }

  if (event.activeView.type === "literalExpression") {
    $("#collapse-decision-inputs").removeClass("show");
    $("#button-decision-inputs").addClass("visually-hidden");
    $("#button-decision-output").removeClass("visually-hidden");
  }

  if (event.activeView.type === "drd") {
    $("#details-decision-label-key").text("DRD Key");
    $("#details-decision-key").text(drg.key);

    $("#details-decision-label-id").text("DRD Id");
    $("#details-decision-id").text(drg.decisionRequirementsId);

    $("#details-decision-label-name").text("DRD Name");
    $("#details-decision-name").text(drg.decisionRequirementsName);

    $("#details-decision-label-version").text("DRD Version");
    $("#details-decision-version").text(drg.version);

    // hide not relevant buttons
    $("#button-decision-inputs").addClass("visually-hidden");
    $("#button-decision-output").addClass("visually-hidden");
    $("#collapse-decision-inputs").removeClass("show");
    $("#collapse-decision-output").removeClass("show");

    // mark decision evaluation state
    const failedDecisionId = decisionEvaluation.failedDecision?.decisionId;
    if (failedDecisionId) {
      markDecisionAsFailed(failedDecisionId);
    }

    evaluatedDecisions
      .filter(
        (evaluatedDecision) =>
          evaluatedDecision.decision.decisionId !== failedDecisionId
      )
      .forEach((evaluatedDecision) => {
        const decisionId = evaluatedDecision.decision.decisionId;
        markDecisionAsEvaluated(decisionId);
      });

    // hide DRD box
    $(".dmn-definitions").each(function () {
      $(this).addClass("visually-hidden");
    });
  }
}

function updateDecisionEvaluationDetails(decision) {
  $("#details-decision-label-key").text("Decision Key");
  $("#details-decision-key").text(decision.key);

  $("#details-decision-label-id").text("Decision Id");
  $("#details-decision-id").text(decision.decisionId);

  $("#details-decision-label-name").text("Decision Name");
  $("#details-decision-name").text(decision.decisionName);

  $("#details-decision-label-version").text("Decision Version");
  $("#details-decision-version").text(decision.version);
}
