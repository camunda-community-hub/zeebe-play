function loadHomeView() {
  configureDemoButtons();

  updateStatus();
}

function configureDemoButtons() {
  sendRequest("demo/", "GET").done(function (processKey) {
    if (processKey) {
      enableButtonToCreateInstanceOfDemoProcess(processKey);
    }
  });
}

function deployDemo() {
  sendRequest("demo/", "POST")
    .done(function (processKey) {
      const toastId = "new-process-" + processKey;
      const content = `Process key ${processKey}<br /><a class="cta" href="/view/process/${processKey}">View process</a>`;
      showNotificationSuccess(
        toastId,
        "Process deployed successfully",
        content
      );

      enableButtonToCreateInstanceOfDemoProcess(processKey);
    })
    .fail(showFailure("deployment-failed", "Failed to deploy demo process"));
}

function enableButtonToCreateInstanceOfDemoProcess(processKey) {
  const createInstanceButton = $("#demo-create-instance-button");
  createInstanceButton.attr("disabled", false);
  createInstanceButton.click(function () {
    track("zeebePlay:bpmnelement:completed", {
      element_type: "START_EVENT",
      From: "home",
      process_id: "solos-transport-process",
    });
    createNewProcessInstanceWith(processKey, {
      captain: "Han Solo",
      ship: "Millennium Falcon",
    });
  });
}

function updateStatus() {
  sendStatusRequest().done(function (response) {
    let zeebePlayVersion = response.zeebePlayVersion;
    let zeebeEngineVersion = response.zeebeEngineVersion;
    let zeebeStatus = response.zeebeStatus;

    $("#version-zeebe-play").text(zeebePlayVersion);
    $("#version-zeebe-engine").text(zeebeEngineVersion);

    let status = `
          <svg class="bi" width="18" height="18" fill="green">
            <use xlink:href="/img/bootstrap-icons.svg#check-circle-fill"/>
          </svg>`;
    if (zeebeStatus === "UNHEALTHY") {
      status = `
          <svg class="bi" width="18" height="18" fill="red">
            <use xlink:href="/img/bootstrap-icons.svg#exclamation-circle-fill"/>
          </svg>`;
    }
    if (zeebeStatus === "UNKNOWN") {
      status = `
          <svg class="bi" width="18" height="18" fill="yellow">
            <use xlink:href="/img/bootstrap-icons.svg#question-circle-fill"/>
          </svg>`;
    }
    $("#status").html(status);
  });
}
