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
          }

          $("#variables-of-process-instance-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>' + variable.name + '</td>'
              + '<td>' + variable.value +'</td>'
              + '<td>' + scopeFormatted +'</td>'
              + '<td>' + variable.timestamp +'</td>'
              + '<td>' + '' +'</td>'
              + '</tr>');
        });
      });
}

