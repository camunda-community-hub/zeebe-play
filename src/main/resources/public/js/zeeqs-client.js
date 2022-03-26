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

const instancesByProcessQuery = `query InstancesOfProcess($key: ID!, $perPage: Int!, $page: Int!) {  
    process(key: $key) {
    
      activeInstances: processInstances(stateIn: [ACTIVATED]) {totalCount}
      completedInstances: processInstances(stateIn: [COMPLETED]) {totalCount}
      terminatedInstances: processInstances(stateIn: [TERMINATED]) {totalCount}
    
      processInstances(perPage: $perPage, page: $page) {
        totalCount
        nodes {
          key
          startTime
          endTime
          state
          incidents(stateIn: [CREATED]) {
            key
          }
        }
      }
    }
  }`;

const messageSubscriptionsByProcessQuery = `query MessageSubscriptionsOfProcess($key: ID!) {  
    process(key: $key) {
    
      messageSubscriptions {
        key
        messageName            
        messageCorrelations {
          timestamp
        }
      }
    }
  }`;

const timersByProcessQuery = `query TimersOfProcess($key: ID!) {  
    process(key: $key) {
    
      timers {
        key
        dueDate
        repetitions
        state
      }
    }
  }`;

const processInstancesQuery = `query ProcessInstances($perPage: Int!, $page: Int!) {  
  
  activeProcessInstances: processInstances(stateIn:[ACTIVATED]) { totalCount }
  completedProcessInstances: processInstances(stateIn:[COMPLETED]) { totalCount }
  terminatedProcessInstances: processInstances(stateIn:[TERMINATED]) { totalCount }
  
  processInstances(page: $page, perPage: $perPage) {
    totalCount
    nodes {
      key      
      state
      startTime
      endTime      
      process {
        key
        bpmnProcessId
        version
      }      
      incidents { key }
    }
  }
  }`;

function fetchData(query, variables) {

  return $.ajax({
    type: 'POST',
    url: '/graphql/',
    data: JSON.stringify({
      query,
      variables,
    }),
    contentType: 'application/json; charset=utf-8',
    accept: 'application/json; charset=utf-8',
    timeout: 5000,
    crossDomain: true,
  })
      .done(function (data) {
        return data.data;
      })
      .fail(showFailure(
          "zeeqs-query-failed-" + query,
          "Failed to query data from ZeeQS's GraphQL API")
      );
}

function queryProcesses(perPage, page) {

  return fetchData(processesQuery, {perPage: perPage, page: page});
}

function queryProcess(processKey) {

  return fetchData(processQuery, {key: processKey});
}

function queryInstancesByProcess(processKey, perPage, page) {

  return fetchData(instancesByProcessQuery, {
    key: processKey,
    perPage: perPage,
    page: page
  });
}

function queryMessageSubscriptionsByProcess(processKey) {

  return fetchData(messageSubscriptionsByProcessQuery, {
    key: processKey
  });
}

function queryTimersByProcess(processKey) {

  return fetchData(timersByProcessQuery, {
    key: processKey
  });
}

function queryProcessInstances(perPage, page) {

  return fetchData(processInstancesQuery, {perPage: perPage, page: page});
}
