function getProcessInstanceKey() {
  return $("#process-instance-page-key").text();
}

function loadProcessInstanceView() {
  const processInstanceKey = getProcessInstanceKey();

  queryProcessInstance(processInstanceKey)
      .done(function (response) {
        let processInstance = response.data.processInstance;
        let process = processInstance.process;

        $("#process-instance-key").text(processInstance.key);
        $("#process-instance-start-time").text(processInstance.startTime);

        let endTime = "-";
        if (processInstance.endTime) {
          endTime = node.endTime;
        }

        $("#process-instance-end-time").text(endTime);

        let state = "";
        switch (processInstance.state) {
          case "ACTIVATED":
            state = '<span class="badge bg-primary">active</span>';
            break;
          case "COMPLETED":
            state = '<span class="badge bg-secondary">completed</span>';
            break;
          case "TERMINATED":
            state = '<span class="badge bg-dark">terminated</span>';
            break;
          default:
            state = "?"
        }

        if (processInstance.incidents.length > 0) {
          state += ' <span class="badge bg-danger">incidents</span>';
        }

        $("#process-instance-state").html(state);

        $("#process-page-key").html(
            '<a href="/view/process/' + process.key + '">'
            + process.key
            + '</a>'
            + ' <span class="text-muted">(' + process.bpmnProcessId + ')</span>'
        );

        const bpmnXML = process.bpmnXML;
        showBpmn(bpmnXML);
      });

  loadVariablesOfProcessInstance();
}

function loadVariablesOfProcessInstance() {

  const processInstanceKey = getProcessInstanceKey();

  queryVariablesByProcessInstance(processInstanceKey)
      .done(function (response) {

        let processInstance = response.data.processInstance;
        let variables = processInstance.variables;

        let totalCount = variables.length;

        $("#variables-total-count").text(totalCount);

        $("#variables-of-process-instance-table tbody").empty();

        const indexOffset = 1;

        variables.forEach((variable, index) => {

          let scope = variable.scope;
          let scopeFormatted = scope.elementId;
          if (scope.elementName) {
            scopeFormatted = scope.elementName;
          }
          if (scope.bpmnElementType == 'PROCESS') {
            scopeFormatted = '<span class="badge bg-primary">global</span>';
          } else {
            scopeFormatted += ' <button type="button" class="btn btn-sm btn-outline-light" title="Highlight element" onclick="highlightElement(\'' + scope.elementId + '\');">'
                + '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#geo-alt"/></svg>'
                + '</button>'
                + ' <span class="badge bg-secondary">local</span>';
          }

          let valueFormatted = '<code>' + variable.value + '</code>';

          let lastUpdatedFormatted = '<div class="row row-cols-1">'
              + '<div class="col">'
              + variable.timestamp;

          let variableUpdatesId = 'variable-updates-' + variable.key;

          if (variable.updates.length > 1) {
            lastUpdatedFormatted += ' <span class="badge bg-secondary">modified</span>'
                + ' <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="collapse" href="#' + variableUpdatesId + '" aria-expanded="false">'
                + '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#eye"/></svg>'
                + '</button>';
          }

          lastUpdatedFormatted += "</div>"

          if (variable.updates.length > 1) {

            let variableUpdates = '<table class="table">'
                + '<thead>'
                + '<tr>'
                + '<th scope="col">Value</th>'
                + '<th scope="col">Update Time</th>'
                + '</tr>'
                + '</thead>'
                + '<tbody>';

            variable.updates.forEach((update) => {
              variableUpdates += '<tr>'
                  + '<td><code>' + update.value + '</code></td>'
                  + '<td>' + update.timestamp +'</td>'
                  + '</tr>';
            });

            variableUpdates += '</tbody></table>';

            lastUpdatedFormatted += '<div class="collapse" id="' + variableUpdatesId + '">'
                + '<div class="col">'
                + variableUpdates
                + '</div>'
                + '</div>';
          }

          lastUpdatedFormatted += '</div>';

          let actionButton = '<button type="button" class="btn btn-sm btn-primary" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Edit">'
              + '<svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#pencil"/></svg>'
              + '</button>';

          $("#variables-of-process-instance-table > tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + variable.name + '</td>'
              + '<td>' + valueFormatted +'</td>'
              + '<td>' + scopeFormatted +'</td>'
              + '<td>' + lastUpdatedFormatted +'</td>'
              + '<td>' + actionButton +'</td>'
              + '</tr>');

        });

      });
}

