const processesQuery = `query Processes($perPage: Int!, $page: Int!) {  
    processes(perPage: $perPage, page: $page) {
      totalCount
      nodes {
        key
        bpmnProcessId
        version
        deployTime
        activeInstances: processInstances(stateIn: [ACTIVATED]) {totalCount}
        completedInstances: processInstances(stateIn: [COMPLETED]) {totalCount}
        terminatedInstances: processInstances(stateIn: [TERMINATED]) {totalCount}
      }
    }
  }`;

function queryProcesses(perPage, page) {

  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: processesQuery,
      variables: {perPage, page},
    })
  })
      .then(r => r.json())
      .then(response => response.data)
      .then(data => data.processes);
}