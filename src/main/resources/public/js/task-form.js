let currentForm;

function showTaskModal(jobKey, elementId) {
  queryVariablesByUserTask(jobKey).then(function (response) {
    const processVariables =
      response.data.userTask.elementInstance.variables.reduce(
        (variables, { name, value }) => {
          variables[name] = JSON.parse(value);
          return variables;
        },
        {}
      );

    const form = JSON.parse(response.data.userTask.form.resource);

    const cachedData = localStorage.getItem(
      "jobCompletion " + getProcessKey() + " " + elementId
    );
    const cachedVariables = JSON.parse(cachedData || "{}");

    const combinedVariables = {
      ...processVariables,
      ...cachedVariables,
    };

    function handleFormSubmit(event, { data, errors }) {
      if (Object.keys(errors).length === 0) {
        // no errors, ready to submit
        completeJob(jobKey, JSON.stringify(data));

        $("#task-form-modal").modal("hide");
      }
    }

    // resets the form to not use the cached response
    function reset() {
      const container = document.querySelector("#task-form-modal .modal-body");
      container.innerHTML = "";

      currentForm = new FormViewer.Form({ container });
      currentForm.importSchema(form, processVariables);
      currentForm.removeCachedVariables = reset;
      currentForm.on("submit", handleFormSubmit);
    }

    // clear modal from previous form
    const container = document.querySelector("#task-form-modal .modal-body");
    container.innerHTML = "";

    currentForm = new FormViewer.Form({ container });
    currentForm.importSchema(form, combinedVariables);
    currentForm.on("submit", handleFormSubmit);
    currentForm.removeCachedVariables = reset;

    $("#task-form-modal").modal("show");
  });
}

function completeTaskForm() {
  currentForm.submit();
}
