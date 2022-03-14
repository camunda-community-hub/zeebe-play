let currentIndex = 0;

function loadProcessesView() {
  loadProcesses();
}

function loadProcesses() {

  queryProcesses()
      .then(processes => {
        let totalCount = processes.totalCount;

        $("#processes-totalCount").text(totalCount);

        $("#processes-table tbody").empty();

        processes.nodes.forEach((node, index) => {
          $("#processes-table tbody:last-child").append('<tr>'
              + '<td>' + (currentIndex + index + 1) +'</td>'
              + '<td>' + node.key +'</td>'
              + '<td>' + node.bpmnProcessId +'</td>'
              + '<td>' + node.version +'</td>'
              + '<td>' + node.deployTime +'</td>'
              + '<td>'
              + '<span class="badge bg-primary">' + node.activeInstances.totalCount + '</span> / '
              + '<span class="badge bg-secondary">' + node.completedInstances.totalCount + '</span> / '
              + '<span class="badge bg-secondary">' + node.terminatedInstances.totalCount + '</span>'
              +'</td>'
              + '</tr>');
        })

        $("#processes-table")
      })
}