function deployDemo() {
  sendRequest("demo/", "POST")
    .done(function (processKey) {
      const toastId = "new-process-" + processKey;
      const content =
        '<a href="/view/process/' + processKey + '">Demo process</a> deployed.';
      showNotificationSuccess(toastId, content);

      enableButtonToCreateInstanceOfDemoProcess(processKey);
    })
    .fail(showFailure("deployment-failed", "Failed to deploy demo process"));
}

function enableButtonToCreateInstanceOfDemoProcess(processKey) {
  const createInstanceButton = $("#demo-create-instance-button");
  createInstanceButton.attr("disabled", false);
  createInstanceButton.click(function () {
    createNewProcessInstanceWith(processKey, {
      captain: "Han Solo",
      ship: "Millennium Falcon",
    });
  });
}

function loadHomeView() {
  sendRequest("demo/", "GET").done(function (processKey) {
    if (processKey) {
      enableButtonToCreateInstanceOfDemoProcess(processKey);
    }
  });
}
