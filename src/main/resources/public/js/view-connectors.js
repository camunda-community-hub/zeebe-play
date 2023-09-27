// store current connector secrets
let connectorSecrets = {};

function loadConnectorsView() {
  loadConnectorSecrets();
  loadAvailableConnectors();
}

function loadConnectorSecrets() {
  sendGetConnectorSecretsRequest().done((response) => {
    let secrets = response.secrets;

    connectorSecrets = secrets;

    $("#connector-secrets-totalCount").text(secrets.length);
    $("#connector-secrets-table tbody").empty();

    secrets.forEach((secret, index) => {
      let editButtonId = `connector-secrets-edit-${index}`;
      let deleteButtonId = `connector-secrets-delete-${index}`;

      let row = `
        <tr>
          <td>${index + 1}</td>
          <td class="secretName"></td>
          <td>
            <code></code>
          </td>
          <td>
            <button id="${editButtonId}" type="button" class="btn btn-sm btn-secondary" title="Edit" data-bs-toggle="modal"
                          data-bs-target="#edit-connector-secret-modal">
              <svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#pencil"/></svg>
                Edit
            </button>
            
            <button id="${deleteButtonId}" type="button" class="btn btn-sm btn-secondary" title="Delete">
              <svg class="bi" width="18" height="18" fill="white"><use xlink:href="/img/bootstrap-icons.svg#trash"/></svg>
                Delete
            </button>
          </td>
        </tr>`;

      $("#connector-secrets-table tbody:last-child").append(row);

      $("#connector-secrets-table tbody:last-child tr:last-child .secretName").text(secret.name);
      $("#connector-secrets-table tbody:last-child tr:last-child code").text(secret.value);

      $("#" + editButtonId).click(function () {
        // fill modal
        $("#edit-connector-secret-name").val(secret.name);
        $("#edit-connector-secret-value").val(secret.value);
      });

      $("#" + deleteButtonId).click(function () {
        // remove the secret from the variable
        connectorSecrets.splice(index, 1);

        updateConnectSecrets();
      });
    });
  });
}

function onAddNewConnectorSecret() {
  let secretNameElement = $("#new-connector-secret-name");
  let secretValueElement = $("#new-connector-secret-value");

  connectorSecrets.push({
    name: secretNameElement.val(),
    value: secretValueElement.val(),
  });

  updateConnectSecrets();

  secretNameElement.val("");
  secretValueElement.val("");
}

function onEditConnectorSecret() {
  let secretName = $("#edit-connector-secret-name").val();
  let secretValue = $("#edit-connector-secret-value").val();

  let index = connectorSecrets.findIndex((item) => item.name === secretName);

  connectorSecrets.splice(index, 1, {
    name: secretName,
    value: secretValue,
  });

  updateConnectSecrets();
}

function updateConnectSecrets() {
  sendUpdateConnectorSecretsRequest(connectorSecrets).done((response) => {
    // reload page
    loadConnectorSecrets();
  });
}

function loadAvailableConnectors() {
  sendGetAvailableConnectorsRequest().done((response) => {
    let connectors = response.connectors;

    $("#available-connectors-totalCount").text(connectors.length);
    $("#available-connectors-table tbody").empty();

    connectors.forEach((connector, index) => {
      let row = `
        <tr>
          <td>${index + 1}</td>
          <td>${connector.name}</td>
          <td>
            <code>${connector.type}</code>
          </td>         
        </tr>`;

      $("#available-connectors-table tbody:last-child").append(row);
    });
  });
}
