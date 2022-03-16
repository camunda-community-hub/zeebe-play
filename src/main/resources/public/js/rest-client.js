
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
