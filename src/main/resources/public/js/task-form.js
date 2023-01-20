let currentForm;

function showTaskModal(jobKey) {
  queryVariablesByUserTask(jobKey).then(function (response) {
    const variables = response.data.userTask.elementInstance.variables.reduce(
      (variables, { name, value }) => {
        variables[name] = JSON.parse(value);
        return variables;
      },
      {}
    );

    const form = JSON.parse(response.data.userTask.form.resource);

    // clear modal from previous form
    const container = document.querySelector("#task-form-modal .modal-body");
    container.innerHTML = "";

    currentForm = new FormViewer.Form({ container });
    currentForm.importSchema(form, variables);
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
