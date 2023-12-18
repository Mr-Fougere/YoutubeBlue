const resolutionStorageName = "currentResolution";
const resolutionTimeOut = 5000,
  resolutionTimeIn = 2500;

let onBlur = false;
let updateResolution, uuid, updateBlur;
let disabled = true;
const regexQuality = /\(([^)]+)\)/;

const getCurrentResolution = (
  resolutionList,
  searchedQuality = "Auto",
  auto = false
) => {
  const resolutionArray = Array.from(resolutionList);
  let resolutionIndex;
  console.log(searchedQuality);
  const resolution = resolutionArray.find((resolution, index) => {
    resolutionIndex = index;
    if (auto) return resolution.innerText == searchedQuality;
    return resolution.getAttribute("aria-checked") === "true";
  });
  if (resolution.innerText == "Auto") {
    console.log("Auto");
    return getCurrentResolution(resolutionList, searchedQuality, true);
  }

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
  const qualityTab = Array.from(settingsList).find(
    (setting) =>
      setting.innerText.includes("Qualité") ||
      setting.innerText.includes("Quality")
  );
  if (!qualityTab) return;
  qualityTab.click();
  return qualityTab;
};

const getResolutionName = (resolutionElement, qualityName) => {
  let resolutionName = resolutionElement.innerText;
  if (!resolutionName.includes("Auto")) return resolutionName;

  resolutionName = qualityName;
  return resolutionName;
};

const qualityTabResolution = (qualityTab) => {
  if (!qualityTab) return
  const matches = qualityTab.innerText.match(regexQuality)
  if (matches) return matches[1]
  return
}

const setQualityResolution = (index = -1, qualityTab = null) => {
  const resolutionList = document.querySelectorAll(
    ".ytp-menuitem[role=menuitemradio]"
  );

  const qualityName = qualityTabResolution(qualityTab);
  const { resolution, resolutionIndex } = getCurrentResolution(
    resolutionList,
    qualityName
  );
  const resolutionName = getResolutionName(resolution, qualityName);
  setCurrentResolutionIndex(resolutionIndex);
  if (index == -1) index = resolutionList.length - 2;
  const newResolution = resolutionList[index];
  if (newResolution) newResolution.click();

  console.log(resolutionName);

  return resolutionName;
};

const changeVideoLowResolution = (timer) => {
  clearTimeout(updateResolution);
  clearTimeout(updateBlur);

  if (disabled) return;
  if (videoPlayer.value.paused || videoPlayer.value.ended) return;
  if (onBlur) return;

  updateBlur = setTimeout(() => {
    videoPlayer.value.style.filter = "brightness(0)";
  }, resolutionTimeOut - 1000);

  updateResolution = setTimeout(() => {
    const qualityTab = openQualitySettings();
    const newResolution = setQualityResolution(-1, qualityTab);
    onBlur = true;
    beginBlurTime(newResolution);
  }, timer || resolutionTimeOut);
};

const changeVideoLastResolution = (timer) => {
  clearTimeout(updateResolution);
  clearTimeout(updateBlur);

  if (disabled) return;
  if (!onBlur) return;

  updateBlur = setTimeout(() => {
    videoPlayer.value.style.filter = "brightness(1)";
  }, resolutionTimeIn + 500);

  updateResolution = setTimeout(() => {
    openQualitySettings();
    setQualityResolution(fetchCurrentResolutionIndex());
    onBlur = false;
    endBlurTime();
  }, timer || resolutionTimeIn);
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
  document.hasFocus()
    ? changeVideoLowResolution(0)
    : changeVideoLastResolution(0);

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
