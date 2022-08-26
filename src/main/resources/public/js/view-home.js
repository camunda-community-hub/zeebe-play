
function deployDemo() {

  sendRequest('demo/', 'POST')
      .done(function(processKey) {

        const toastId = "new-process-" + processKey;
        const content = '<a href="/view/process/' + processKey + '">Demo process</a> deployed.';
        showNotificationSuccess(toastId, content);

        const createInstanceButton = $("#demo-create-instance-button");
        createInstanceButton.attr('disabled', false);
        createInstanceButton.click(function () {
          createNewProcessInstanceWith(processKey, {key: "demo"});
        });
      })
      .fail(showFailure(
          "deployment-failed",
          "Failed to deploy demo process")
      );
}
