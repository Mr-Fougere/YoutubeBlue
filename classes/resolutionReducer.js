class ResolutionReducer {
  REGEX_PLAYER = /\(([^)]+)\)/;
  RESOLUTION_STORAGE_NAME = "currentResolution";
  RESOLUTION_TIMEOUT = 5000;
  RESOLUTION_TIMEIN = 2500;

  constructor() {
    this.onBlur = false;
    this.updateResolution = null;
    this.updateBlur = null;
    this.player = null;
    this.uuid = null;
    this.active = false;
    this.videoPlayer = null;
    this.lastResolution = null;
  }

  getCurrentResolution = (
    resolutionList,
    searchedQuality = "Auto",
    auto = false
  ) => {
    const resolutionArray = Array.from(resolutionList);
    let resolutionIndex;
    const resolution = resolutionArray.find((resolution, index) => {
      resolutionIndex = index;
      if (auto) return resolution.innerText == searchedQuality;
      return resolution.getAttribute("aria-checked") === "true";
    });
    if (resolution.innerText == "Auto") {
      return this.getCurrentResolution(resolutionList, searchedQuality, true);
    }

    return { resolution, resolutionIndex };
  };

  setCurrentResolutionIndex = (currentResolutionIndex) => {
    this.lastResolution = currentResolutionIndex;
  };

  fetchCurrentResolutionIndex = () => {
    if (!this.lastResolution) return 1;
    return this.lastResolution;
  };

  openQualitySettings = () => {
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

  getResolutionName = (resolutionElement, qualityName) => {
    let resolutionName = resolutionElement.innerText;
    if (!resolutionName.includes("Auto")) return resolutionName;

    resolutionName = qualityName;
    return resolutionName;
  };

  qualityTabResolution = (qualityTab) => {
    if (!qualityTab) return;
    const matches = qualityTab.innerText.match(this.REGEX_PLAYER);
    if (matches) return matches[1];
    return;
  };

  setQualityResolution = (index = -1, resolutionList) => {
    if (index == -1) index = resolutionList.length - 2;
    const newResolution = resolutionList[index];
    if (newResolution) newResolution.click();
  };

  updateLastResolution = (resolutionList = [], qualityTab = null) => {
    const qualityName = this.qualityTabResolution(qualityTab);
    const { resolution, resolutionIndex } = this.getCurrentResolution(
      resolutionList,
      qualityName
    );
    const resolutionName = this.getResolutionName(resolution, qualityName);
    this.setCurrentResolutionIndex(resolutionIndex);

    return resolutionName;
  };

  changeVideoLowResolution = (timer) => {
    clearTimeout(this.updateResolution);
    clearTimeout(this.updateBlur);

    if (!this.active) return;
    if (this.videoPlayer.paused || this.videoPlayer.ended) return;
    if (this.onBlur) return;

    this.updateBlur = setTimeout(() => {
      this.videoPlayer.style.filter = "brightness(0.1)";
    }, this.RESOLUTION_TIMEOUT - 1000);

    this.updateResolution = setTimeout(() => {
      const qualityTab = this.openQualitySettings();
      const resolutionList = document.querySelectorAll(
        ".ytp-menuitem[role=menuitemradio]"
      );
      const currentResolution = this.updateLastResolution(
        resolutionList,
        qualityTab
      );
      this.setQualityResolution(-1, resolutionList);
      this.onBlur = true;
      this.beginBlurTime(currentResolution);
    }, timer || this.RESOLUTION_TIMEOUT);
  };

  changeVideoLastResolution = (timer, forced = false) => {
    clearTimeout(this.updateResolution);
    clearTimeout(this.updateBlur);

    if (!this.active) return;

    if (!forced || !this.onBlur) return;

    this.updateBlur = setTimeout(() => {
      this.videoPlayer.style.filter = "brightness(1)";
    }, this.RESOLUTION_TIMEIN + 500);

    this.updateResolution = setTimeout(() => {
      this.openQualitySettings();
      const resolutionList = document.querySelectorAll(
        ".ytp-menuitem[role=menuitemradio]"
      );
      this.setQualityResolution(
        this.fetchCurrentResolutionIndex(),
        resolutionList
      );
      this.onBlur = false;
      this.endBlurTime();
    }, timer || this.RESOLUTION_TIMEIN);
  };

  sendResolutionBlurStatus = (state) => {
    browser.runtime
      .sendMessage({
        action: "setFeatureState",
        name: "resolutionBlur",
        state: state,
      })
      .catch(() =>
        setTimeout(() => this.sendResolutionBlurStatus(state), 1000)
      );
  };

  changeActiveStatus = (status) => {
    this.onBlur = false;
    this.active = status;
    this.sendResolutionBlurStatus(status);
  };

  setListeners = (player, videoPlayer) => {
    this.player = player;
    this.videoPlayer = videoPlayer;

    window.addEventListener("focus", () => {
      this.changeVideoLastResolution();
    });

    window.addEventListener("blur", () => {
      this.changeVideoLowResolution();
    });

    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (!this.active) return;
      if (request.action === "checkBlur") {
        sendResponse({ uuid: this.uuid });
      }
    });
  };

  beginBlurTime = (resolution) => {
    browser.runtime
      .sendMessage({
        action: "beginBlur",
        resolution: resolution,
      })
      .then((response) => {
        if (!response) return;
        this.uuid = response.uuid;
      })
      .catch(() => setTimeout(() => this.beginBlurTime(resolution), 1000));
  };

  endBlurTime = () => {
    browser.runtime
      .sendMessage({
        action: "endBlur",
        uuid: this.uuid,
      })
      .catch(() => setTimeout(() => this.endBlurTime(), 1000));
  };
}
