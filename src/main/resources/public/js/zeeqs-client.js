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

const processQuery = `query Process($key: ID!) {  
    process(key: $key) {
      key
      bpmnProcessId
      version
      deployTime
      bpmnXML
    }
  }`;

function fetchData(query, variables) {

  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    })
  })
      .then(r => r.json())
      .then(response => response.data);
}

function queryProcesses(perPage, page) {

  return fetchData(processesQuery, {perPage: perPage, page: page})
      .then(data => data.processes);
}

function queryProcess(processKey) {

  return fetchData(processQuery, {key: processKey})
      .then(data => data.process);
}