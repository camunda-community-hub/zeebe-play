// No Tracking by default
window.track = () => {};

if (window.location.hash.startsWith("#identifier")) {
  const payload = decodeURIComponent(
    window.location.hash.substring("#identifier".length)
  );

  localStorage.setItem("identifier", payload);

  window.location.hash = "";
}

const trackingSetting = JSON.parse(localStorage.getItem("identifier") || "{}");

if (trackingSetting.token) {
  const mixpanelScript = document.createElement("script");

  mixpanelScript.innerHTML = `(function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,
    0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";"mixpanel"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<l.length;h++)c(e,l[h]);var f="set set_once union unset remove delete".split(" ");e.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));e.push([d,call2])}}for(var b={},d=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<f.length;c++)a(f[c]);return b};a._i.push([b,d,g])};a.__SV=1.2;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
    MIXPANEL_CUSTOM_LIB_URL:"file:"===c.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName("script")[0];d.parentNode.insertBefore(b,d)}})(document,window.mixpanel||[]);
    mixpanel.init("${trackingSetting.token}", {batch_requests: true, opt_out_tracking_by_default: true});
    mixpanel.register({ stage: "${trackingSetting.stage}" });`;

  document.head.appendChild(mixpanelScript);

  mixpanel.opt_in_tracking();
  mixpanel.register({
    distinct_id: trackingSetting.distinct_id,
    stage: trackingSetting.stage,
    org_id: trackingSetting.orgId,
    orgId: trackingSetting.orgId,
    license: trackingSetting.license,
    orgOwner: trackingSetting.orgOwner,
  });

  window.track = (...args) => mixpanel.track?.(...args);

  window.track?.("zeebePlay:view:page", {
    view: getViewName(),
    url: location.href,
  });
}

function getViewName() {
  return /\/view\/([^\/]+)/gm.exec(location.href)?.[1];
}

function trackElementInstanceCompletion(elementInstance) {
  const { bpmnElementType } = elementInstance.element;

  // start events are handled when instances are started to extract "From:" property
  if (bpmnElementType === "START_EVENT") return;

  const bpmnId = getBpmnProcessId();
  const elementInstanceTrackingState = JSON.parse(
    localStorage.getItem("tracking:" + bpmnId) || "{}"
  );

  // check if the element is a connector
  const element = bpmnViewer
    .get("elementRegistry")
    .get(elementInstance.element.elementId);
  const businessObject = element?.businessObject ?? element;

  let connector = null;
  if (businessObject?.hasOwnProperty("modelerTemplate")) {
    connector = businessObject?.modelerTemplate;
  } else if (businessObject?.$attrs?.hasOwnProperty("zeebe:modelerTemplate")) {
    connector = businessObject?.$attrs["zeebe:modelerTemplate"];
  }

  const connectorId = convertConnectorId(connector);
  const hasConnector = Boolean(connectorId);

  const connectorOrElementType = connectorId || bpmnElementType;

  // track process completion
  if (
    bpmnElementType === "PROCESS" &&
    !elementInstanceTrackingState[bpmnElementType + ":" + elementInstance.key]
  ) {
    track?.("zeebePlay:bpmnelement:completed", {
      element_type: "PROCESS",
      process_id: bpmnId,
    });
    elementInstanceTrackingState[
      bpmnElementType + ":" + elementInstance.key
    ] = true;
    elementInstanceTrackingState[bpmnElementType] = true;
  }

  // track element completion
  if (!elementInstanceTrackingState[connectorOrElementType]) {
    track?.("zeebePlay:bpmnelement:completed", {
      [hasConnector ? "connector_type" : "element_type"]:
        connectorOrElementType,
      process_id: bpmnId,
    });
    elementInstanceTrackingState[connectorOrElementType] = true;
  }

  localStorage.setItem(
    "tracking:" + bpmnId,
    JSON.stringify(elementInstanceTrackingState)
  );
}

function convertConnectorId(id) {
  if (id && !id.startsWith("io.camunda.connectors.")) {
    return "proprietary_connector";
  }
  return id;
}

function trackIncident(incident) {
  const incidentTrackingState = JSON.parse(
    localStorage.getItem("incidentTracking") || "{}"
  );

  if (incidentTrackingState[incident.key]) return;

  track?.("zeebePlay:incident:trigger", {
    error: incident.errorMessage,
    process_id: getBpmnProcessId(),
  });

  incidentTrackingState[incident.key] = true;

  localStorage.setItem(
    "incidentTracking",
    JSON.stringify(incidentTrackingState)
  );
}
