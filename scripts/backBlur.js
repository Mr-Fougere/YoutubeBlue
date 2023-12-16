const RESOLUTION_CONSOMMATION = {
  "144p": 0.0021,
  "240p": 0.0075,
  "360p": 0.013,
  "480p": 0.0198,
  "720p": 0.0677,
  "720p60": 0.0677,
  "1080p HD": 0.1146,
  "1440p HD": 0.1875,
  "2160p 4K": 0.4948,
  "4320 8K": 0.5469,
}; // Mo/s

let blurData,
  blurTime = {};

const checkBlurOn = async (uuid, tabId) => {
  try {
    const response = await browser.tabs.sendMessage(tabId, {
      action: "checkBlur",
    });
    if (response.uuid === uuid) {
      console.log("blur on");
    } else {
      console.log("blur off");
      stopBlurTime(uuid, true);
    }
  } catch (error) {
    console.log("Error checking blur:", error);
    stopBlurTime(uuid, true);
  }
};

const blurIncrement = (uuid, tabId) => {
  const interval = setInterval(() => {
    blurTime[uuid].time++;
    if (blurTime[uuid].time % 5 == 0) {
      checkBlurOn(uuid, tabId);
    }
  }, 1000);
  return interval;
};

const newBlurTime = (resolution, tabId) => {
  const blurUuid = Date.now();
  blurTime[blurUuid] = {
    resolution: resolution,
    time: 0,
    interval: blurIncrement(blurUuid, tabId),
    data: 0,
    tabId: tabId,
  };

  return blurUuid;
};

const blurSaving = (blur) => {
  const currentResolutionData =
    Math.round(blur.time * RESOLUTION_CONSOMMATION[blur.resolution] * 100) /
    100;
  const lowerResolutionData =
    Math.round(blur.time * RESOLUTION_CONSOMMATION["144p"] * 100) / 100;
  return currentResolutionData - lowerResolutionData;
};

const injectNewBlur = async (blur) => {
  const message = {
    resolution: blur.resolution,
    data: blur.data,
    time: blur.time,
  };
  await dataInjector.openDB();
  await dataInjector.add(message)
  await pullItems()
  dataInjector.closeDB();
};

const stopBlurTime = async (uuid, abrupt = false) => {
  if (!blurTime[uuid]) return;

  blurTime[uuid].time = blurTime[uuid].time - (abrupt ? 5 : 0);
  clearInterval(blurTime[uuid].interval);
  if (blurTime[uuid].time > 0) blurTime[uuid].data = blurSaving(blurTime[uuid]);
  await injectNewBlur(blurTime[uuid]);
  delete blurTime[uuid];
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "beginBlur") {
    if (["144p", "Auto"].includes(request.resolution)) return;
    const uuid = newBlurTime(request.resolution, sender.tab.id);
    sendResponse({ uuid: uuid });
  }

  if (request.action == "endBlur") {
    stopBlurTime(request.uuid);
  }
});
