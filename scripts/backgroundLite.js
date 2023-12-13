const DEFAULT_COUNT = 0;
const DEFAULT_TIME_SKIPPED = 0;
const DEFAULT_STORAGE_VERSION = "lite";
const STORAGE_VERSIONS = ["lite", "advanced"];

const fetchSkipInformationsLite = () => {
  const count = localStorage.getItem("youSkipCount");
  const timeSkipped = localStorage.getItem("youSkipTimeSkipped");
  const storageVersion = localStorage.getItem("youSkipStorageVersion");

  return {
    count: count || DEFAULT_COUNT,
    time: timeSkipped || DEFAULT_TIME_SKIPPED,
    storage: storageVersion || DEFAULT_STORAGE_VERSION,
  };
};

const addNewSkipLite = (duration) => {
  var youSkipCount = parseInt(localStorage.getItem("youSkipCount"));
  var youSkipTimeSkipped = parseInt(localStorage.getItem("youSkipTimeSkipped"));

  if (!youSkipCount) youSkipCount = 0;
  if (!youSkipTimeSkipped) youSkipTimeSkipped = 0;
  youSkipCount++;
  youSkipTimeSkipped += parseInt(duration);
  localStorage.setItem("youSkipCount", youSkipCount);
  localStorage.setItem("youSkipTimeSkipped", youSkipTimeSkipped);
};

const getStorageVersion = () => {
  return localStorage.getItem("youSkipStorageVersion");
};

const setStorageVersion = (version) => {
  let storageVersion = STORAGE_VERSIONS.includes(version)
    ? version
    : DEFAULT_STORAGE_VERSION;
  localStorage.setItem("youSkipStorageVersion", storageVersion);
};

browser.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
) {
  if (request.action == "setStorageVersion") {
    setStorageVersion(request.value);
  }

  if (request.action == "getStorageVersion") {
    sendResponse(getStorageVersion() || DEFAULT_STORAGE_VERSION);
  }

  if (request.version != DEFAULT_STORAGE_VERSION) return;

  if (request.action === "newSkip") {
    addNewSkipLite(request.duration);
  }

  if (request.action === "fetchGeneralInformations") {
    const skipInformations = fetchSkipInformationsLite();
    sendResponse(skipInformations);
  }
});
