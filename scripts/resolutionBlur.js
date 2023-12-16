const resolutionStorageName = "currentResolution";
const blurTimeOut = 5000,
  focusTimeOut = 2500;
let onBlur = false;
let updateResolution, uuid;
let disabled = true;

const getCurrentResolution = (resolutionList) => {
  const resolutionArray = Array.from(resolutionList);
  let resolutionIndex;
  const resolution = resolutionArray.find((resolution, index) => {
    resolutionIndex = index;
    return resolution.getAttribute("aria-checked") === "true";
  });
  return { resolution, resolutionIndex };
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

const setQualityResolution = (index = -1) => {
  const resolutionList = document.querySelectorAll(
    ".ytp-menuitem[role=menuitemradio]"
  );
  const { resolution, resolutionIndex } = getCurrentResolution(resolutionList);
  setCurrentResolutionIndex(resolutionIndex);
  if (index == -1) index = resolutionList.length - 2;
  const newResolution = resolutionList[index];
  if (newResolution) newResolution.click();
  return resolution.innerText;
};

const changeVideoLowResolution = (timer) => {
  clearTimeout(updateResolution);
  if (disabled) return;
  if (onBlur) return;
  updateResolution = setTimeout(() => {
    openQualitySettings();
    const newResolution = setQualityResolution();
    onBlur = true;
    beginBlurTime(newResolution);
  }, timer || blurTimeOut);
};

const changeVideoLastResolution = (timer) => {
  clearTimeout(updateResolution);
  if (disabled) return;
  if (!onBlur) return;
  updateResolution = setTimeout(() => {
    openQualitySettings();
    setQualityResolution(fetchCurrentResolutionIndex());
    onBlur = false;
    endBlurTime();
  }, timer || focusTimeOut);
};

const sendResolutionBlurStatus = (state) => {
  browser.runtime.sendMessage({
    action: "setFeatureState",
    name: "resolutionBlur",
    state: state,
  });
};

const enableWindowListeners = () => {
  changeVideoLastResolution(0);
  onBlur = false;
  disabled = false;
  sendResolutionBlurStatus(true);
};

const disableWindowListeners = () => {
  onBlur = true;
  changeVideoLastResolution(0);
  onBlur = false;
  disabled = true;
  sendResolutionBlurStatus(false);
};

const updaterBlurListeners = () => {
  window.addEventListener("focus", () => {
    changeVideoLastResolution();
  });

  window.addEventListener("blur", () => {
    changeVideoLowResolution();
  });

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (disabled) return;
    if (request.action === "checkBlur") {
      sendResponse({ uuid: uuid });
    }
  });
};

const beginBlurTime = (resolution) => {
  browser.runtime
    .sendMessage({
      action: "beginBlur",
      resolution: resolution,
    })
    .then((response) => {
      if (!response) return;
      uuid = response.uuid;
    });
};

const endBlurTime = () => {
  browser.runtime.sendMessage({
    action: "endBlur",
    uuid: uuid,
  });
};

updaterBlurListeners();
