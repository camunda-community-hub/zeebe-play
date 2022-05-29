
function updatePagination(prefix, perPage, currentPage, totalCount) {

  let previousButton = $("#" + prefix + "-pagination-previous-button");
  let first = $("#" + prefix + "-pagination-first");
  let firstGap = $("#" + prefix + "-pagination-first-gap");
  let previous = $("#" + prefix + "-pagination-previous");
  let current = $("#" + prefix + "-pagination-current");
  let next = $("#" + prefix + "-pagination-next");
  let lastGap = $("#" + prefix + "-pagination-last-gap");
  let last = $("#" + prefix + "-pagination-last");
  let nextButton = $("#" + prefix + "-pagination-next-button");

  // first.text(1);
  previous.text(currentPage - 1 + 1);
  current.text(currentPage + 1);
  next.text(currentPage + 1 + 1);

  let lastPage = Math.trunc(totalCount / perPage);

  if (totalCount % perPage == 0) {
    lastPage = lastPage - 1;
  }
  last.text(lastPage + 1);

  if (currentPage < 3) {
    firstGap.addClass("d-none");
  } else {
    firstGap.removeClass("d-none");
  }

  if (currentPage < 2) {
    first.addClass("d-none");
  } else {
    first.removeClass("d-none");
  }

  if (currentPage < 1) {
    previous.addClass("d-none");
    previousButton.addClass("disabled");
  } else {
    previous.removeClass("d-none");
    previousButton.removeClass("disabled");
  }

  if (currentPage > lastPage - 3) {
    lastGap.addClass("d-none");
  } else {
    lastGap.removeClass("d-none");
  }

  if (currentPage > lastPage - 2) {
    last.addClass("d-none");
  } else {
    last.removeClass("d-none");
  }

  if (currentPage > lastPage - 1) {
    next.addClass("d-none");
    nextButton.addClass("disabled");
  } else {
    next.removeClass("d-none");
    nextButton.removeClass("disabled");
  }
}

function showNotificationSuccess(id, content) {

  const toastId = "new-toast-" + id;

  const newNotificationToast = '<div id="' + toastId + '" class="toast" role="status" aria-live="polite" aria-atomic="true">'
      + '<div class="toast-header bg-success text-white">'
      + '<strong class="me-auto">Success</strong>'
      + '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>'
      + '</div>'
      + '<div class="toast-body">'
      + content
      + '</div>'
      + '</div>';

  let notificationToastContainer = $("#notifications-toast-container");

  notificationToastContainer.append(newNotificationToast);

  let newInstanceToast = $("#" + toastId);
  let toast = new bootstrap.Toast(newInstanceToast);
  toast.show();
}

function showNotificationFailure(id, content) {

  const toastId = "new-toast-" + id;

  const newNotificationToast = '<div id="' + toastId + '" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">'
      + '<div class="toast-header bg-danger text-white">'
      + '<strong class="me-auto">Failure</strong>'
      + '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>'
      + '</div>'
      + '<div class="toast-body">'
      + content
      + '</div>'
      + '</div>';

  let notificationToastContainer = $("#notifications-toast-container");

  notificationToastContainer.append(newNotificationToast);

  let newInstanceToast = $("#" + toastId);
  let toast = new bootstrap.Toast(newInstanceToast);
  toast.show();
}

function showFailure(actionId, message) {
  return function (xhr, status, error) {
    const toastId = actionId;

    var failureMessage = error;
    if (xhr.responseJSON) {
      failureMessage = xhr.responseJSON.message;
    }

    const content = message + ': <code>' + failureMessage + '</code>';

    showNotificationFailure(toastId, content);
  }
}

function getCurrentView() {
  return $("#current-view").text();
}

function loadView() {
  switch (getCurrentView()) {
    case "process": {
      loadProcessView();
      break;
    }
    case "process-instance": {
      loadProcessInstanceView();
      break;
    }
    default: {
      console.debug("Unable to load view: view is unknown");
    }
  }
}

// ----------------------------------------

function formatTimerRepetitions(timer) {
  if (timer.repetitions < 0) {
    // show infinity symbol
    return '<svg class="bi" width="18" height="18"><use xlink:href="/img/bootstrap-icons.svg#infinity"/></svg>';
  } else {
    return timer.repetitions;
  }
}

