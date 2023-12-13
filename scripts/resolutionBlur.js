const getCurrentResolutionIndex = (resolutionList) => {
  const resolutionArray = Array.from(resolutionList);
  const currentResolution = resolutionArray.find((resolution) => {
    const ariaCheckedValue = resolution.getAttribute("aria-checked");
    return ariaCheckedValue === "true";
  });
  return resolutionArray.indexOf(currentResolution);
};

const setCurrentResolutionIndex = (currentResolutionIndex) => {
  localStorage.setItem(resolutionStorageName, currentResolutionIndex);
};

const fetchCurrentResolutionIndex = () => {
  const currentResolution = localStorage.getItem(resolutionStorageName);
  if (!currentResolution) return null;
  return parseInt(currentResolution);
};

const changeVideoLowResolution = () => {
  const settingButton = document.getElementsByClassName(
    "ytp-button ytp-settings-button"
  )[0];
  settingButton.click();
  const settingsList = document.getElementsByClassName("ytp-menuitem");
  settingsList[settingsList.length - 1].click();
  setTimeout(() => {
    const resolutionList =
      document.getElementById("ytp-id-18").children[0].children[1].children;
    const currentResolutionIndex = getCurrentResolutionIndex(resolutionList);
    setCurrentResolutionIndex(currentResolutionIndex);
    const lowResolutionIndex = resolutionList.length - 2;
    const lowResolutionButton = resolutionList[lowResolutionIndex];
    lowResolutionButton.click();
  }, 2000);
};

const changeVideoLastResolution = () => {
  let resolutionList = null;
  const settingButton = document.getElementsByClassName(
    "ytp-button ytp-settings-button"
  )[0];
  settingButton.click();
  const settingsList = document.getElementsByClassName("ytp-menuitem");
  console.log(settingsList);
  if (settingsList[0].role == "menuitemcheckbox")
    resolutionList == settingsList;
  console.log(resolutionList);
  if (!resolutionList) {
    settingsList[settingsList.length - 1].click();
    resolutionList =
      document.getElementById("ytp-id-18").children[0].children[1].children;
  }
  let currentResolution = fetchCurrentResolutionIndex(resolutionList);
  if (!currentResolution) currentResolution = resolutionList.length - 1;
  console.log(currentResolution);
  console.log(resolutionList);
  resolutionList[currentResolution].click();
};

window.addEventListener("focus", function () {
  changeVideoLastResolution();
});

window.addEventListener("blur", function () {
  changeVideoLowResolution();
});
