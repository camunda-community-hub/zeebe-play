let currentForm;

function showTaskModal(formKey, jobKey) {
  const processInstanceKey = getProcessInstanceKey();

  queryVariablesByProcessInstance(processInstanceKey).done(function (response) {
    const processInstance = response.data.processInstance;
    const variables = processInstance.variables.reduce(
      (variables, { name, value }) => {
        variables[name] = JSON.parse(value);
        return variables;
      },
      {}
    );

    const formId = formKey.split(":").pop();
    const processElement = bpmnViewer
      .get("elementRegistry")
      .filter(
        ({ businessObject }) =>
          businessObject.$instanceOf("bpmn:Process") ||
          businessObject.processRef?.$instanceOf("bpmn:Process")
      )
      .map(
        (element) => element.businessObject.processRef || element.businessObject
      )
      .find((e) =>
        e.extensionElements?.values.some((extension) => extension.id === formId)
      );
    const formContent = JSON.parse(
      processElement.extensionElements.values.find(
        (extension) => extension.id === formId
      ).$body
    );

    // clear modal from previous form
    const container = document.querySelector("#task-form-modal .modal-body");
    container.innerHTML = "";

    currentForm = new FormViewer.Form({ container });
    currentForm.importSchema(formContent, variables);
    currentForm.on(
      "submit",
      function handleFormSubmit(event, { data, errors }) {
        if (Object.keys(errors).length === 0) {
          // no errors, ready to submit
          completeJob(jobKey, JSON.stringify(data));

          $("#task-form-modal").modal("hide");
        }
      }
    );

    $("#task-form-modal").modal("show");
  });
}

function completeTaskForm() {
  currentForm.submit();
}

function getFormKeyForElement(elementId) {
  const element = bpmnViewer
    .get("elementRegistry")
    .get(elementId).businessObject;
  const isUserTask = element.$instanceOf("bpmn:UserTask");
  if (isUserTask) {
    return element.extensionElements?.values?.find((extension) =>
      extension.$instanceOf("zeebe:formDefinition")
    )?.formKey;
  }
}
