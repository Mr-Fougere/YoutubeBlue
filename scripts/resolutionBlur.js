const resolutionStorageName = "currentResolution";
const blurTimeOut = 5000,
  focusTimeOut = 2500;
let onBlur = false;
let updateResolution;

const getCurrentResolutionIndex = (resolutionList) => {
  const resolutionArray = Array.from(resolutionList);
  const resolutionIndex = resolutionArray.findIndex((resolution, index) => {
    return resolution.getAttribute("aria-checked") === "true";
  });
  return resolutionIndex;
};

const setCurrentResolutionIndex = (currentResolutionIndex) => {
  localStorage.setItem(resolutionStorageName, currentResolutionIndex);
};

const fetchCurrentResolutionIndex = () => {
  const currentResolution = localStorage.getItem(resolutionStorageName);
  if (!currentResolution) return 1;
  return parseInt(currentResolution);
};

const openQualitySettings = () => {
  const resolutionList = document.querySelectorAll(
    ".ytp-menuitem[role=menuitemradio]"
  );
  if (resolutionList.length > 0) return;

  const settingButton = document.querySelector(
    "button.ytp-button.ytp-settings-button"
  );
  settingButton.click();

  const settingsList = document.querySelectorAll(".ytp-menuitem");
  settingsList[settingsList.length - 1].click();
};

const setQualityResolution = (index = false) => {
  const resolutionList = document.querySelectorAll(
    ".ytp-menuitem[role=menuitemradio]"
  );
  const currentResolutionIndex = getCurrentResolutionIndex(resolutionList);
  setCurrentResolutionIndex(currentResolutionIndex);
  if (!index) index = resolutionList.length - 2;
  const newResolution = resolutionList[index];
  newResolution.click();
};

const changeVideoLowResolution = () => {
  clearTimeout(updateResolution);
  if (onBlur) return;
  updateResolution = setTimeout(() => {
    openQualitySettings();
    setQualityResolution();
    onBlur = true;
  }, blurTimeOut);
};

const changeVideoLastResolution = () => {
  clearTimeout(updateResolution);
  if (!onBlur) return;
  updateResolution = setTimeout(() => {
    openQualitySettings();
    setQualityResolution(fetchCurrentResolutionIndex());
    onBlur = false;
  }, focusTimeOut);
};

const setWindowListeners = () => {
  window.addEventListener("focus", function () {
    changeVideoLastResolution();
  });

  window.addEventListener("blur", function () {
    changeVideoLowResolution();
  });

  onBlur = false;
};

const unsetWindowListeners = () => {
  window.removeEventListener("focus", function () {
    changeVideoLastResolution();
  });

  window.removeEventListener("blur", function () {
    changeVideoLowResolution();
  });

  onBlur = true;
  changeVideoLastResolution();
};

const updaterBlurListeners = () => {
  browser.runtime.onMessage.addListener((request) => {
    if (
      request.action === "updateFeatureState" &&
      request.name === "resolutionBlur"
    ) {
      if (request.state) setWindowListeners();
      else unsetWindowListeners();
    }
  });
};

const launchResolutionBlur = () => {
  browser.runtime
    .sendMessage({ action: "getFeatureState", name: "resolutionBlur" })
    .then((response) => {
      if (response) setWindowListeners();
    });

    updaterBlurListeners();
};

launchResolutionBlur();
