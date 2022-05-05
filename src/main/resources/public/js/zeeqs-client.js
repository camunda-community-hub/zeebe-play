const processesQuery = `query Processes($perPage: Int!, $page: Int!, $zoneId: String!) {  
    processes(perPage: $perPage, page: $page) {
      totalCount
      nodes {
        key
        bpmnProcessId
        version
        deployTime(zoneId: $zoneId)
        activeInstances: processInstances(stateIn: [ACTIVATED]) {totalCount}
        completedInstances: processInstances(stateIn: [COMPLETED]) {totalCount}
        terminatedInstances: processInstances(stateIn: [TERMINATED]) {totalCount}
      }
    }
  }`;

const processQuery = `query Process($key: ID!, $zoneId: String!) {  
    process(key: $key) {
      key
      bpmnProcessId
      version
      deployTime(zoneId: $zoneId)
      bpmnXML
    }
  }`;

const instancesByProcessQuery = `query InstancesOfProcess($key: ID!, $perPage: Int!, $page: Int!, $zoneId: String!) {  
    process(key: $key) {
    
      activeInstances: processInstances(stateIn: [ACTIVATED]) {totalCount}
      completedInstances: processInstances(stateIn: [COMPLETED]) {totalCount}
      terminatedInstances: processInstances(stateIn: [TERMINATED]) {totalCount}
    
      processInstances(perPage: $perPage, page: $page) {
        totalCount
        nodes {
          key
          startTime(zoneId: $zoneId)
          endTime(zoneId: $zoneId)
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

const timersByProcessQuery = `query TimersOfProcess($key: ID!, $zoneId: String!) {  
    process(key: $key) {
    
      timers {
        key
        dueDate(zoneId: $zoneId)
        repetitions
        state
      }
    }
  }`;

const processInstancesQuery = `query ProcessInstances($perPage: Int!, $page: Int!, $zoneId: String!) {  
  
  activeProcessInstances: processInstances(stateIn:[ACTIVATED]) { totalCount }
  completedProcessInstances: processInstances(stateIn:[COMPLETED]) { totalCount }
  terminatedProcessInstances: processInstances(stateIn:[TERMINATED]) { totalCount }
  
  processInstances(page: $page, perPage: $perPage) {
    totalCount
    nodes {
      key      
      state
      startTime(zoneId: $zoneId)
      endTime(zoneId: $zoneId)      
      process {
        key
        bpmnProcessId
        version
      }      
      incidents { key }
    }
  }
  }`;

const processInstanceQuery = `query ProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {
      key      
      startTime(zoneId: $zoneId)
      endTime(zoneId: $zoneId)      
      state
      
      process {
        key
        bpmnProcessId
        bpmnXML
      }
      
      incidents {
        key
      }
    }
  }`;

const variablesByProcessInstanceQuery = `query VariablesOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
      variables {
        key
        name
        value        
        timestamp(zoneId: $zoneId)                
        updates {
          value
          timestamp(zoneId: $zoneId)
        }
        scope {
          key
          elementId
          elementName
          bpmnElementType
        }
      }
    }
  }`;

const elementInstancesByProcessInstanceQuery = `query ElementInstancesOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
       elementInstances {
        key
        elementId
        elementName
        bpmnElementType
        state
        startTime(zoneId: $zoneId)
        endTime(zoneId: $zoneId)
        
        scope {
          key
        }
        
        stateTransitions {
          state
          timestamp(zoneId: $zoneId)
        }        
      }
      
      activeElementInstances: elementInstances(stateIn:[ACTIVATING, ACTIVATED, COMPLETING]) {
        elementId
        bpmnElementType
      }
      
      completedElementInstances: elementInstances(stateIn:[COMPLETED]) {
        elementId
        bpmnElementType
      }
      
      terminatedElementInstances: elementInstances(stateIn:[TERMINATED]) {
        elementId
        bpmnElementType
      }
      
      takenSequenceFlows: elementInstances(stateIn: [TAKEN]) {
        elementId
      }
      
      elementInstancesWithIncidents: incidents(stateIn: [CREATED]) {
        elementInstance {
          elementId
        }
      }
    }
  }`;

const jobsByProcessInstanceQuery = `query JobsOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
       jobs {
          key
          jobType
          state
          timestamp(zoneId: $zoneId)
          startTime(zoneId: $zoneId)
          endTime(zoneId: $zoneId)
          
          elementInstance {
            key
            elementId
            elementName
            bpmnElementType
          }
      }
    }
  }`;

const incidentsByProcessInstanceQuery = `query IncidentsOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
      incidents {
        key
        errorType
        errorMessage
        state
        creationTime(zoneId: $zoneId)
        resolveTime(zoneId: $zoneId)
        
        elementInstance {
          key
          elementId
          elementName
          bpmnElementType
        }
        
        job { key }
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

function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function queryProcesses(perPage, page) {

  return fetchData(processesQuery, {
    perPage: perPage,
    page: page,
    zoneId: getTimeZone()
  });
}

function queryProcess(processKey) {

  return fetchData(processQuery, {
    key: processKey,
    zoneId: getTimeZone()
  });
}

function queryInstancesByProcess(processKey, perPage, page) {

  return fetchData(instancesByProcessQuery, {
    key: processKey,
    perPage: perPage,
    page: page,
    zoneId: getTimeZone()
  });
}

function queryMessageSubscriptionsByProcess(processKey) {

  return fetchData(messageSubscriptionsByProcessQuery, {
    key: processKey
  });
}

function queryTimersByProcess(processKey) {

  return fetchData(timersByProcessQuery, {
    key: processKey,
    zoneId: getTimeZone()
  });
}

function queryProcessInstances(perPage, page) {

  return fetchData(processInstancesQuery, {
    perPage: perPage,
    page: page,
    zoneId: getTimeZone()
  });
}

function queryProcessInstance(processInstanceKey) {

  return fetchData(processInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone()
  });
}

function queryVariablesByProcessInstance(processInstanceKey) {

  return fetchData(variablesByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone()
  });
}

function queryElementInstancesByProcessInstance(processInstanceKey) {

  return fetchData(elementInstancesByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone()
  });
}

function queryJobsByProcessInstance(processInstanceKey) {

  return fetchData(jobsByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone()
  });
}

function queryIncidentsByProcessInstance(processInstanceKey) {

  return fetchData(incidentsByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone()
  });
}