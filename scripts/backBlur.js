const RESOLUTION_CONSOMMATION = {
  "144p": 0.0021,
  "240p": 0.0075,
  "360p": 0.013,
  "480p": 0.0198,
  "720p": 0.0677,
  "1080p": 0.1146,
  "1440p": 0.1875,
  "4k": 0.4948,
  "8k": 0.5469,
};

let blurData,
  blurTime = {};

const checkBlurOn = (uuid) => {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    const youtubeTabs = tabs.filter((tab) =>
      tab.url.includes("youtube.com/watch?v=")
    );
    if (youtubeTabs.length == 0) return stopBlurTime(uuid, true);

    youtubeTabs.forEach((tab) => {
      browser.tabs
        .sendMessage(tab.id, {
          action: "checkBlur",
          uuid: uuid,
        })
        .then((response) => {
          if (response.uuid == uuid) {
            console.log("blur on");
          } else {
            console.log("blur off");
            stopBlurTime(uuid, true);
          }
        })
        .catch(() => {
          stopBlurTime(uuid, true);
        });
    });
  });
};

const blurIncrement = (uuid) => {
  const interval = setInterval(() => {
    blurTime[uuid].time++;
    if (blurTime[uuid].time % 5 == 0) {
      checkBlurOn(uuid);
    }
  }, 1000);
  return interval;
};

const newBlurTime = (resolution) => {
  const blurUuid = Date.now();
  blurTime[blurUuid] = {
    resolution: resolution,
    time: 0,
    interval: blurIncrement(blurUuid),
    data: 0,
  };

  return blurUuid;
};

const blurSaving = (blur) => {
    return Math.round(blur.time * RESOLUTION_CONSOMMATION[blur.resolution]);
}

const stopBlurTime = (uuid, abrupt = false) => {
  if (!blurTime[uuid]) return;
  console.log(blurTime[uuid]);

  blurTime[uuid].time = blurTime[uuid].time - (abrupt ? 0 : 5);
  clearInterval(blurTime[uuid].interval);
  blurTime[uuid].data = blurSaving(blurTime[uuid])
  console.log(blurTime[uuid]);
  delete blurTime[uuid];
};

browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action == "beginBlur") {
    const uuid = newBlurTime(request.resolution);
    sendResponse({ uuid: uuid });
  }

  if (request.action == "endBlur") {
    stopBlurTime(request.uuid);
  }
});
