const observerConfig = { childList: true, subtree: true },
  skipCountName = "youSkipCount",
  targetMutationClassList = "video-ads ytp-ad-module",
  skipButtonClassList = "ytp-ad-skip-button-slot",
  doubleSkipButtonClassList =
    "ytp-ad-skip-button-container ytp-ad-skip-button-container-detached",
  DEFAULT_AD_TIME = 5; // in seconds
let videoTryCount = 0,
  playerTryCount = 0,
  playerObserver;

const forwardAdVideo = () => {
  videoPlayer.value.currentTime = videoPlayer.value.duration;
  videoPlayer.value.play();
  return { videoDuration: Math.round(videoPlayer.value.duration) };
};

const checkDoubleSkipAd = () => {
  const doubleSkip = document.getElementsByClassName(
    "video-ads ytp-ad-module"
  )[0];

  if (!doubleSkip) return;

  const doubleSkipButton = doubleSkip.getElementsByClassName(
    doubleSkipButtonClassList
  )[0];
  if (!doubleSkipButton) return;

  doubleSkipButton.click();
};

const skipAd = () => {
  const adPlayer = document.getElementsByClassName(
    "ytp-ad-player-overlay-skip-or-preview"
  )[0];
  if (!adPlayer) return;
  const { videoDuration } = forwardAdVideo();

  const skipButton = adPlayer.firstChild.lastChild;

  const skippableAd = skipButton.classList.value == skipButtonClassList;
  checkDoubleSkipAd();
  addNewSkip(skippableAd, skippableAd ? DEFAULT_AD_TIME : videoDuration);
};

const playerCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.classList.value != targetMutationClassList) break;
    skipAd();
  }
};

const addNewSkip = (skippable, duration) => {
  const message = {
    action: "newInjection",
    data: {
      duration: duration,
      skippable: skippable,
    },
  };
  browser.runtime.sendMessage(message);
};

const sendAdsSkipperStatus = (state) => {
  browser.runtime.sendMessage({
    action: "setFeatureState",
    name: "adsSkipper",
    state: state,
  });
};

const setPlayer = () => {
  const player = document.getElementById("player");
  if (!player) {
    if (playerTryCount > 10) return;
    playerTryCount++;
    setTimeout(() => setPlayer, 100);
  }

  videoPlayer.value.addEventListener("playing", () => setTimeout(() => skipAd(), 250));

  playerObserver = new MutationObserver(playerCallback);
  playerObserver.observe(player, observerConfig);
  sendAdsSkipperStatus(true);
};

const unsetPlayer = () => {
  try {
    if (videoPlayer.value)
      videoPlayer.value.removeEventListener("playing", () =>
        setTimeout(() => skipAd(), 250)
      );
    playerObserver.disconnect();
    sendAdsSkipperStatus(false);
  } catch (error) {}
};
