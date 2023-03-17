async function openResolveIncidentModal(incidentKey, jobKey) {
  const processInstanceKey = getProcessInstanceKey();

  document.querySelector("#new-toast-new-incident .btn-close")?.click();

  const [incidentResponse, variableResponse] = await Promise.all([
    queryIncidentsByProcessInstance(processInstanceKey),
    queryVariablesByProcessInstance(processInstanceKey),
  ]);

  const variables = variableResponse.data.processInstance.variables;
  const incident = incidentResponse.data.processInstance.incidents.find(
    ({ key }) => key === incidentKey
  );

  document.getElementById("resolve-incident-error-message").textContent =
    incident.errorMessage;

  document.getElementById("resolve-incident-key").value = incidentKey;
  document.getElementById("resolve-incident-jobKey").value = jobKey;

  const variablesSection = document.getElementById(
    "resolve-incident-variables-section"
  );
  if (variables.length === 0) {
    variablesSection.classList.add("hidden");
  } else {
    variablesSection.classList.remove("hidden");
  }

  const variablesTable = document.getElementById(
    "resolve-incident-variables-table"
  );

  variablesTable.innerHTML = "";

  variables.forEach((variable) => {
    const entryHTML = `<td class="name"></td><td class="value"><code></code></td><td class="scope"><span class="badge"></span></td><td class="scopeElement"></td><td class="scopeKey"></td>`;
    const row = document.createElement("tr");

    row.innerHTML = entryHTML;

    row.querySelector(".name").textContent = variable.name;
    row.querySelector(".value code").textContent = variable.value;

    if (variable.scope.element.bpmnElementType === "PROCESS") {
      row.querySelector(".badge").textContent = "global";
      row.querySelector(".badge").classList.add("bg-primary");
    } else {
      row.querySelector(".badge").textContent = "local";
      row.querySelector(".badge").classList.add("bg-secondary");
    }

    row.querySelector(".scopeElement").innerHTML = formatBpmnElementInstance(
      variable.scope.element
    );
    row
      .querySelector(".scopeElement")
      .removeChild(row.querySelector(".scopeElement button"));

    row.querySelector(".scopeKey").textContent = variable.scope.key;

    variablesTable.appendChild(row);
  });

  $("#resolve-incident-modal").modal("show");
}

async function confirmResolveIncidentModal() {
  $("#resolve-incident-modal").modal("hide");

  let scope = $("#resolve-incident-variables-scope").val();
  const variables = $("#resolve-incident-variables-payload").val();

  if (scope === "global") {
    scope = getProcessInstanceKey();

    history.push({
      action: "setVariables",
      variables,
    });
    refreshHistory();
  }

  let hasVariables = true;
  try {
    hasVariables = Object.keys(JSON.parse(variables || "{}")).length > 0;
  } catch (e) {
    // unparseable variable input
    // let's assume there are variables and let the backend figure it out
  }

  if (!hasVariables) {
    track("zeebePlay:single-operation", {
      operationType: "RESOLVE_INCIDENT",
      process_id: getBpmnProcessId(),
    });

    return resolveIncident(
      $("#resolve-incident-key").val(),
      $("#resolve-incident-jobKey").val()
    );
  }

  sendSetVariablesRequest(getProcessInstanceKey(), scope, variables)
    .done((key) => {
      const incidentKey = $("#resolve-incident-key").val();
      const jobKey = $("#resolve-incident-jobKey").val();

      document.getElementById("resolve-incident-variables-scope").value =
        "global";
      document.getElementById("resolve-incident-variables-payload").value = "";

      showNotificationSuccess(
        "set-variables-" + key,
        "Variables set successfully",
        "<code>" + variables + "</code>"
      );

      track("zeebePlay:single-operation", {
        operationType: "RESOLVE_INCIDENT",
        process_id: getBpmnProcessId(),
      });

      resolveIncident(incidentKey, jobKey);
    })
    .fail(
      showFailure(
        "set-variables" + scope,
        "Failed to set variables <code>" + variables + "</code>."
      )
    );
}
