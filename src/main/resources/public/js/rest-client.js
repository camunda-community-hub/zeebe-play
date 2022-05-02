
function sendRequest(path, type, data) {

  return $.ajax({
    type: type,
    url: '/rest/' + path,
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    timeout: 5000,
    crossDomain: true,
  })
      .done(function (data) {
        return data;
      });
}

function sendPostRequest(path, data) {
  return sendRequest(path, 'POST', data);
}

function sendDeleteRequest(path, data) {
  return sendRequest(path, 'DELETE', data);
}

function sendCreateInstanceRequest(processKey, variables) {
  return sendPostRequest("processes/" + processKey,  variables);
}

function sendPublishMessageRequestWithName(messageName) {
  return sendPostRequest("messages", {
    messageName: messageName
  });
}

function sendPublishMessageRequest(messageName, correlationKey, variables, timeToLive, messageId) {
  return sendPostRequest("messages", {
    messageName: messageName,
    correlationKey: correlationKey,
    variables: variables,
    timeToLive: timeToLive,
    messageId: messageId
  });
}

function sendTimeTravelRequestWithDuration(duration) {
  return sendPostRequest("timers", {
    duration: duration
  });
}

function sendTimeTravelRequestWithDateTime(dateTime) {
  return sendPostRequest("timers", {
    dateTime: dateTime
  });
}

function deployResources(resources) {

  return $.ajax({
    type: 'POST',
    url: '/rest/deployments/',
    data: new FormData(resources),
    processData: false,
    contentType: false,
    timeout: 5000,
    crossDomain: true,
  });
}

function sendCancelProcessInstanceRequest(processInstanceKey) {
  return sendDeleteRequest("process-instances/" + processInstanceKey, { });
}

function sendSetVariablesRequest(processInstanceKey, scopeKey, variables) {
  return sendPostRequest("process-instances/" + processInstanceKey + "/variables", {
    scopeKey: scopeKey,
    variables: variables
  });
}

function sendCompleteJobRequest(jobKey, variables) {
  return sendPostRequest("jobs/" + jobKey + "/complete", {
    variables: variables
  });
}

function sendFailJobRequest(jobKey, retries, errorMessage) {
  return sendPostRequest("jobs/" + jobKey + "/fail", {
    retries: retries,
    errorMessage: errorMessage
  });
}

function sendThrowErrorJobRequest(jobKey, errorCode, errorMessage) {
  return sendPostRequest("jobs/" + jobKey + "/fail", {
    retries: retries,
    errorMessage: errorMessage
  });
}
