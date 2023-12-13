const DEFAULT_COUNT = 0;
const DEFAULT_TIME_SKIPPED = 0;
const DEFAULT_STORAGE_VERSION = "lite";
const STORAGE_VERSIONS = ["lite", "advanced"];

const fetchSkipInformationsLite = () => {
  var count = localStorage.getItem("youSkipCount");
  var timeSkipped = localStorage.getItem("youSkipTimeSkipped");
  var storageVersion = localStorage.getItem("youSkipStorageVersion");

  return {
    count: count || DEFAULT_COUNT,
    time: timeSkipped || DEFAULT_TIME_SKIPPED,
    storage: storageVersion || DEFAULT_STORAGE_VERSION,
  };
};

const addNewSkipLite = (value) => {
  var youSkipCount = parseInt(localStorage.getItem("youSkipCount"));
  var youSkipTimeSkipped = parseInt(localStorage.getItem("youSkipTimeSkipped"));

  if (!youSkipCount) youSkipCount = 0;
  if (!youSkipTimeSkipped) youSkipTimeSkipped = 0;
  youSkipCount++;
  youSkipTimeSkipped += parseInt(value);
  localStorage.setItem("youSkipCount", youSkipCount);
  localStorage.setItem("youSkipTimeSkipped", youSkipTimeSkipped);
};

browser.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
) {
  if (request.action == "setStorageVersion") {
    let storageVersion = STORAGE_VERSIONS.includes(request.value)
      ? request.value
      : DEFAULT_STORAGE_VERSION;
    localStorage.setItem("youSkipStorageVersion", storageVersion);
  }

  if (request.action == "getStorageVersion") {
    let storageVersion = localStorage.getItem("youSkipStorageVersion");
    sendResponse(storageVersion || DEFAULT_STORAGE_VERSION);
  }

  if (request.version != DEFAULT_STORAGE_VERSION) return;

  if (request.action === "generalInformations") {
    const skipInformations = fetchSkipInformationsLite();
    sendResponse(skipInformations);
  }

  if (request.action === "newSkip") {
    addNewSkipLite(request.value);
  }
});
