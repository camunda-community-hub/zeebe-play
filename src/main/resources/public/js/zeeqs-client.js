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
          error {
            position
          }
        }
      }
    }
  }`;

const messageSubscriptionsByProcessQuery = `query MessageSubscriptionsOfProcess($key: ID!, $zoneId: String!) {  
    process(key: $key) {
    
      messageSubscriptions {
        key
        messageName            
        messageCorrelations {
          timestamp(zoneId: $zoneId)
          message {
            key
          }
          processInstance {
            key
          }
        }
        element {
          elementId
          elementName
          bpmnElementType
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
        element {
          elementId
          elementName
          bpmnElementType
        }
        elementInstance { key }
      }
    }
  }`;

const elementsByProcessQuery = `query ElementsOfProcess($key: ID!) {  
    process(key: $key) {
      elements {
        elementId
        
        activeElementInstances: elementInstances(stateIn: [ACTIVATING, ACTIVATED, COMPLETING]) { totalCount }
        completedElementInstances: elementInstances(stateIn: [COMPLETED]) { totalCount }
        terminatedElementInstances: elementInstances(stateIn: [TERMINATED]) { totalCount }
      }
    }
  }`;

const elementsInfoByProcessQuery = `query ElementsInfoOfProcess($key: ID!) {  
    process(key: $key) {
      elements {
        elementId
        elementName
        bpmnElementType
        
        metadata {
          jobType
          conditionExpression 
          timerDefinition
          errorCode
          calledProcessId
          messageSubscriptionDefinition {
            messageName
            messageCorrelationKey
          }
          userTaskAssignmentDefinition {
            assignee
            candidateGroups
          }
        }
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
      incidents(stateIn: [CREATED]) { 
        key 
      }
      error {
        position
      }
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
      
      incidents(stateIn: [CREATED]) {
        key
      }
      
      error {
        position
      }
    }
  }`;

const variablesByProcessInstanceQuery = `query VariablesOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
      state
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
          element {
            elementId
            elementName
            bpmnElementType
          }
        }
      }
    }
  }`;

const elementInstancesByProcessInstanceQuery = `query ElementInstancesOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
       elementInstances {
        key
        element {
          elementId
          elementName
          bpmnElementType
        }
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
        element {
          elementId
          bpmnElementType
        }
      }
      
      completedElementInstances: elementInstances(stateIn:[COMPLETED]) {
        element {
          elementId
          bpmnElementType
        }
      }
      
      terminatedElementInstances: elementInstances(stateIn:[TERMINATED]) {
        element {
          elementId
          bpmnElementType
        }
      }
      
      takenSequenceFlows: elementInstances(stateIn: [TAKEN]) {
        element {
          elementId
        }
      }
      
      elementInstancesWithIncidents: incidents(stateIn: [CREATED]) {
        elementInstance {
          element {
            elementId
          }
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
            element {
              elementId
              elementName
              bpmnElementType
            }
          }
      }
    }
  }`;

const userTasksByProcessInstanceQuery = `query UserTasksOfProcessInstance($key: ID!) {  
    processInstance(key: $key) {    
       userTasks(perPage: 100) {
        totalCount
        nodes {
          key
          state
          
          assignee
          candidateGroups
          
          form {
            resource
          }
          
          elementInstance {
            key
            element {
              elementId
              elementName
              bpmnElementType
            }
          }
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
          element {
            elementId
            elementName
            bpmnElementType
          }
        }
        
        job { key }
      }
    }
  }`;

const messageSubscriptionByProcessInstanceQuery = `query MessageSubscriptionsOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
      messageSubscriptions {
        key
        messageName
        messageCorrelationKey
        
        state
        timestamp(zoneId: $zoneId)
        
        elementInstance {
          key
          state
        }
        
        element {
          elementId
          elementName
          bpmnElementType
        }
        
        messageCorrelations {
          timestamp(zoneId: $zoneId)
          message {
            key
          }
        }
      }
    }
  }`;

const timersByProcessInstanceQuery = `query TimersOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
    timers {
      key
      repetitions
      dueDate(zoneId: $zoneId)
      state
      elementInstance {
        key        
      }
      element {
        elementId
        elementName
        bpmnElementType
      }
    }
  }
}`;

const elementsInfoByProcessInstanceQuery = `query ElementsInfoOfProcessInstance($key: ID!) {  
    processInstance(key: $key) {
      process {
        elements {
          elementId
          elementName
          bpmnElementType
          
          metadata {
            jobType
            conditionExpression 
            timerDefinition
            errorCode
            calledProcessId
            messageSubscriptionDefinition {
              messageName
              messageCorrelationKey
            }
            userTaskAssignmentDefinition {
              assignee
              candidateGroups
            }
          }
        }
      }
    }
  }`;

const errorByProcessInstanceQuery = `query ErrorOfProcessInstance($key: ID!) {  
    processInstance(key: $key) {    
      error {
        exceptionMessage
        stacktrace
      }
    }
  }`;

const messageByKeyQuery = `query Message($key: ID!, $zoneId: String!) { 
  message(key: $key) {
    key
    name
    correlationKey
    messageId
    timeToLive
    state
    timestamp(zoneId: $zoneId)
    variables {
      name
      value
    }
  }
}`;

const childInstancesByProcessInstanceQuery = `query ChildInstancesOfProcessInstance($key: ID!, $zoneId: String!) {  
    processInstance(key: $key) {    
      childProcessInstances {
        key
        state
        startTime(zoneId: $zoneId)
        endTime(zoneId: $zoneId)    
        process {
          bpmnProcessId
        }      
        parentElementInstance {
          key
          element {
            elementId
            elementName
            bpmnElementType
          }
        }
        incidents(stateIn: [CREATED]) {
          key
        }
        error {
          position
        }
      }
    }
  }`;

const parentInstanceByProcessInstanceQuery = `query ParentInstanceOfProcessInstance($key: ID!) {  
    processInstance(key: $key) {   
      # === level 1 ===
      parentElementInstance {
        processInstance {
          key
          process { bpmnProcessId }
          # === level 2 ===
          parentElementInstance {
            processInstance {
              key
              process { bpmnProcessId }
              # === level 3 ===
              parentElementInstance {
                processInstance {
                  key
                  process { bpmnProcessId }
                }
              }
            }
          }
        }
      }
    }
  }`;

const incidentsQuery = `query Incidents($perPage: Int!, $page: Int!, $zoneId: String!) {  
  
  createdIncidents: incidents(stateIn:[CREATED]) { totalCount }
  resolvedIncidents: incidents(stateIn:[RESOLVED]) { totalCount }
  
  incidents(page: $page, perPage: $perPage) {
    totalCount
    nodes {
      key      
      errorType
      errorMessage
      state
      creationTime(zoneId: $zoneId)
      resolveTime(zoneId: $zoneId)
      processInstance {
        key
        process {
          bpmnProcessId
        }
      }
    }
  }
  }`;

const messagesQuery = `query Messages($perPage: Int!, $page: Int!, $zoneId: String!) {  
  messages(page: $page, perPage: $perPage) {
    totalCount
    nodes {
      key
      name
      correlationKey
      state
      messageCorrelations {
        timestamp(zoneId: $zoneId)
        processInstance {
          key
          process {
            bpmnProcessId
          }
        }
      }
    }
  }
  
  publishedMessages: messages(stateIn: [PUBLISHED]) { totalCount }
  expiredMessages: messages(stateIn: [EXPIRED]) { totalCount }
  
  }`;

const variablesByUserTaskQuery = `query VariablesOfUserTask($key: ID!) {  
  userTask(key: $key) {
    form {
      resource
    }
    elementInstance {
      variables(localOnly: false) {
        name
        value
      }
    }
  }
}`;

function fetchData(query, variables) {
  return $.ajax({
    type: "POST",
    url: "/graphql/",
    data: JSON.stringify({
      query,
      variables,
    }),
    contentType: "application/json; charset=utf-8",
    accept: "application/json; charset=utf-8",
    timeout: 5000,
    crossDomain: true,
  })
    .done(function (data) {
      return data.data;
    })
    .fail(
      showFailure(
        "zeeqs-query-failed-" + query,
        "Failed to query data from ZeeQS's GraphQL API"
      )
    );
}

function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function queryProcesses(perPage, page) {
  return fetchData(processesQuery, {
    perPage: perPage,
    page: page,
    zoneId: getTimeZone(),
  });
}

function queryProcess(processKey) {
  return fetchData(processQuery, {
    key: processKey,
    zoneId: getTimeZone(),
  });
}

function queryInstancesByProcess(processKey, perPage, page) {
  return fetchData(instancesByProcessQuery, {
    key: processKey,
    perPage: perPage,
    page: page,
    zoneId: getTimeZone(),
  });
}

function queryMessageSubscriptionsByProcess(processKey) {
  return fetchData(messageSubscriptionsByProcessQuery, {
    key: processKey,
    zoneId: getTimeZone(),
  });
}

function queryTimersByProcess(processKey) {
  return fetchData(timersByProcessQuery, {
    key: processKey,
    zoneId: getTimeZone(),
  });
}

function queryElementsByProcess(processKey) {
  return fetchData(elementsByProcessQuery, {
    key: processKey,
  });
}

function queryElementsInfoByProcess(processKey) {
  return fetchData(elementsInfoByProcessQuery, {
    key: processKey,
  });
}

function queryProcessInstances(perPage, page) {
  return fetchData(processInstancesQuery, {
    perPage: perPage,
    page: page,
    zoneId: getTimeZone(),
  });
}

function queryProcessInstance(processInstanceKey) {
  return fetchData(processInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryVariablesByProcessInstance(processInstanceKey) {
  return fetchData(variablesByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryElementInstancesByProcessInstance(processInstanceKey) {
  return fetchData(elementInstancesByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryJobsByProcessInstance(processInstanceKey) {
  return fetchData(jobsByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryUserTasksByProcessInstance(processInstanceKey) {
  return fetchData(userTasksByProcessInstanceQuery, {
    key: processInstanceKey,
  });
}

function queryIncidentsByProcessInstance(processInstanceKey) {
  return fetchData(incidentsByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryMessageSubscriptionsByProcessInstance(processInstanceKey) {
  return fetchData(messageSubscriptionByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryTimersByProcessInstance(processInstanceKey) {
  return fetchData(timersByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryMessageByKey(messageKey) {
  return fetchData(messageByKeyQuery, {
    key: messageKey,
    zoneId: getTimeZone(),
  });
}

function queryChildInstancesByProcessInstance(processInstanceKey) {
  return fetchData(childInstancesByProcessInstanceQuery, {
    key: processInstanceKey,
    zoneId: getTimeZone(),
  });
}

function queryParentInstanceByProcessInstance(processInstanceKey) {
  return fetchData(parentInstanceByProcessInstanceQuery, {
    key: processInstanceKey,
  });
}

function queryElementInfosByProcessInstance(processInstanceKey) {
  return fetchData(elementsInfoByProcessInstanceQuery, {
    key: processInstanceKey,
  });
}

function queryIncidents(perPage, page) {
  return fetchData(incidentsQuery, {
    perPage: perPage,
    page: page,
    zoneId: getTimeZone(),
  });
}

function queryMessages(perPage, page) {
  return fetchData(messagesQuery, {
    perPage: perPage,
    page: page,
    zoneId: getTimeZone(),
  });
}

function queryErrorByProcessInstanceKey(processInstanceKey) {
  return fetchData(errorByProcessInstanceQuery, {
    key: processInstanceKey,
  });
}

function queryVariablesByUserTask(userTask) {
  return fetchData(variablesByUserTaskQuery, { key: userTask });
}

function subscribeToUpdates(type, key, handler) {
  const socketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(
    socketProtocol + "://" + window.location.host + "/graphql"
  );

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "connection_init", payload: {} }));
    socket.send(
      JSON.stringify({
        // since we only have one subscription on the socket,
        // the id is irrelevant and can be a single character to reduce traffic
        id: "1",
        type: "subscribe",
        payload: {
          variables: {},
          extensions: {},
          operationName: null,
          query: `subscription {
      processInstanceUpdates(filter: {${type}: ${key}}) {
        updateType
      }
    }`,
        },
      })
    );
  });

  socket.addEventListener("message", (event) => {
    const response = JSON.parse(event.data);
    if (response.type === "next") {
      handler(response);
    }
  });
}
