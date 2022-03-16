const instancesOfProcessPerPage = 5;
let instancesOfProcessCurrentPage = 0;

function getProcessKey() {
  return $("#process-page-key").text();
}

function loadProcessView() {
  const processKey = getProcessKey();

  queryProcess(processKey)
      .done(function (response) {
        let process = response.data.process;
        $("#process-key").text(process.key);
        $("#bpmnProcessId").text(process.bpmnProcessId);
        $("#process-version").text(process.version);
        $("#process-deployment-time").text(process.deployTime);

        const bpmnXML = process.bpmnXML;
        showBpmn(bpmnXML);
      });

  loadInstancesOfProcess(0);
}

function loadInstancesOfProcess(currentPage) {

  const processKey = getProcessKey();
  instancesOfProcessCurrentPage = currentPage;

  queryInstancesByProcess(processKey, instancesOfProcessPerPage, instancesOfProcessCurrentPage)
      .done(function (response) {

        let process = response.data.process;
        $("#process-instances-active").text(process.activeInstances.totalCount);
        $("#process-instances-completed").text(process.completedInstances.totalCount);
        $("#process-instances-terminated").text(process.terminatedInstances.totalCount);

        let processInstances = process.processInstances;
        let totalCount = processInstances.totalCount;

        $("#process-instances-total-count").text(totalCount);

        $("#instances-of-process-table tbody").empty();

        const indexOffset = instancesOfProcessCurrentPage * instancesOfProcessPerPage + 1;

        processInstances.nodes.forEach((node, index) => {

          let state = "";
          switch (node.state) {
            case "ACTIVATED":
              state = '<span class="badge bg-primary">active</span>';
              break;
            case "COMPLETED":
              state = '<span class="badge bg-secondary">completed</span>';
              break;
            case "TERMINATED":
              state = '<span class="badge bg-secondary">terminated</span>';
              break;
            default:
              state = "?"
          }

          if (node.incidents.length > 0) {
            state += ' <span class="badge bg-danger">incidents</span>';
          }

          let endTime = "";
          if (node.endTime) {
            endTime = node.endTime;
          }

          $("#instances-of-process-table tbody:last-child").append('<tr>'
              + '<td>' + (indexOffset + index) +'</td>'
              + '<td>'
              + '<a href="/view/process-instance/' + node.key + '">' + node.key + '</a>'
              + '</td>'
              + '<td>' + node.startTime +'</td>'
              + '<td>' + endTime +'</td>'
              + '<td>' + state +'</td>'
              + '</tr>');
        });

        updateInstancesOfProcessPagination(totalCount);
      });
}

function updateInstancesOfProcessPagination(totalCount) {
  updatePagination("instances-of-process", instancesOfProcessPerPage, instancesOfProcessCurrentPage, totalCount);
}

function loadInstancesOfProcessFirst() {
  loadInstancesOfProcess(0);
}

function loadInstancesOfProcessPrevious() {
  loadInstancesOfProcess(instancesOfProcessCurrentPage - 1);
}

function loadInstancesOfProcessNext() {
  loadInstancesOfProcess(instancesOfProcessCurrentPage + 1);
}
function loadInstancesOfProcessLast() {
  let last = $("#instances-of-process-pagination-last").text() - 1;
  loadInstancesOfProcess(last);
}

function createNewProcessInstance() {
  const processKey = getProcessKey();
  createNewProcessInstanceWith(processKey, {});
}

function createNewProcessInstanceWithVariables() {
  const processKey = getProcessKey();
  const variables = $("#newInstanceVariables").val();

  let json = JSON.parse(variables);

  createNewProcessInstanceWith(processKey, json);
}

function createNewProcessInstanceWith(processKey, variables) {

  sendCreateInstanceRequest(processKey, variables)
      .done(processInstanceKey => {

        showNotificationNewInstanceCreated(processInstanceKey);

        loadInstancesOfProcess(instancesOfProcessCurrentPage);
      })
      .fail(showFailure(
          "create-instance-failed-" + processKey,
          "Failed to create process instance")
      );
}

function showNotificationNewInstanceCreated(processInstanceKey) {

  const toastId = "new-instance-" + processInstanceKey;
  const content = 'New process instance <a id="new-instance-toast-link" href="/views/process-instance/"' + processInstanceKey + '>' + processInstanceKey + '</a> created.';

  showNotificationSuccess(toastId, content);
}
