
function sendRequest(path, data) {

  return $.ajax({
    type: 'POST',
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

function sendCreateInstanceRequest(processKey, variables) {
  return sendRequest("processes/" + processKey,  variables);
}

function sendPublishMessageRequestWithName(messageName) {
  return sendRequest("messages", {
    messageName: messageName
  });
}

function sendPublishMessageRequest(messageName, correlationKey, variables, timeToLive, messageId) {
  return sendRequest("messages", {
    messageName: messageName,
    correlationKey: correlationKey,
    variables: variables,
    timeToLive: timeToLive,
    messageId: messageId
  });
}

function sendTimeTravelRequestWithDuration(duration) {
  return sendRequest("timers", {
    duration: duration
  });
}

function sendTimeTravelRequestWithDateTime(dateTime) {
  return sendRequest("timers", {
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
