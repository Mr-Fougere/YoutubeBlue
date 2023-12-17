class BlurManager extends DataInjector {

  RESOLUTION_CONSOMMATION = {
    "144p": 0.0021,
    "240p": 0.0075,
    "360p": 0.013,
    "480p": 0.0198,
    "720p": 0.0677,
    "720p60": 0.0677,
    "1080p HD": 0.1146,
    "1080p60 HD": 0.1146,
    "1440p HD": 0.1875,
    "2160p 4K": 0.4948,
    "4320 8K": 0.5469,
  };

  constructor() {
    super()
    this.blurTime = {};
  }

  checkBlurOn = async (uuid, tabId) => {
    try {
      const response = await browser.tabs.sendMessage(tabId, {
        action: "checkBlur",
      });
      if (response.uuid !== uuid) {
        this.stopBlurTime(uuid, true);
      }
    } catch (error) {
      console.log("Error checking blur:", error);
      this.stopBlurTime(uuid, true);
    }
  };

  blurIncrement = (uuid, tabId) => {
    const interval = setInterval(() => {
      this.blurTime[uuid].time++;
      if (this.blurTime[uuid].time % 5 == 0) {
        this.checkBlurOn(uuid, tabId);
      }
    }, 1000);
    return interval;
  };

  newBlurTime = (resolution, tabId) => {
    const blurUuid = Date.now();
    this.blurTime[blurUuid] = {
      resolution: resolution,
      time: 0,
      interval: this.blurIncrement(blurUuid, tabId),
      data: 0,
      tabId: tabId,
    };

    return blurUuid;
  };

  blurSaving = (blur) => {
    const currentResolutionData =
      Math.round(blur.time * this.RESOLUTION_CONSOMMATION[blur.resolution] * 100) /
      100;
    const lowerResolutionData =
      Math.round(blur.time * this.RESOLUTION_CONSOMMATION["144p"] * 100) / 100;
    return currentResolutionData - lowerResolutionData;
  };

  injectNewBlur = async (blur) => {
    const message = {
      resolution: blur.resolution,
      data: blur.data,
      time: blur.time,
    };
    await this.openDB();
    await this.add(message);
    await pullItems();
    dataInjector.closeDB();
  };

  stopBlurTime = async (uuid, abrupt = false) => {
    if (!this.blurTime[uuid]) return;

    this.blurTime[uuid].time = this.blurTime[uuid].time - (abrupt ? 5 : 0);
    clearInterval(this.blurTime[uuid].interval);
    if (this.blurTime[uuid].time > 0)
      this.blurTime[uuid].data = this.blurSaving(this.blurTime[uuid]);
    await this.injectNewBlur(this.blurTime[uuid]);
    delete this.blurTime[uuid];
  };
}
