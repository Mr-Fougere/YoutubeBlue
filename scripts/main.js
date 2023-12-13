const observerConfig = { childList: true, subtree: true };
const skipCountName = "youSkipCount";
const targetMutationClassList = "video-ads ytp-ad-module";
const skipButtonClassList = "ytp-ad-skip-button-slot";
const resolutionStorageName = "youSkipResolutionIndex";
const DEFAULT_AD_TIME = 5; // in seconds

const unskippableAd = () => {
  const video = document.getElementsByTagName("VIDEO")[0];
  video.currentTime = video.duration;
  video.play();
  addNewSkip(Math.round(video.duration));
};

const skippableAd = (skipButton) => {
  skipButton.click();
  addNewSkip();
};

const skipAd = () => {
  console.log("skipping ad");
  const adPlayer = document.getElementsByClassName(
    "ytp-ad-player-overlay-skip-or-preview"
  )[0];
  if (!adPlayer) return;
  const skipButton = adPlayer.firstChild.lastChild;
  if (skipButton.classList.value == skipButtonClassList) {
    skippableAd(skipButton);
  } else {
    unskippableAd();
  }
};

const playerCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.classList.value != targetMutationClassList) break;
    skipAd();
  }
};

const addNewSkip = (time = DEFAULT_AD_TIME) => {
  browser.runtime.sendMessage({
    action: "newSkip",
    value: time,
  });
};

const setPlayer = () => {
  const player = document.getElementById("player");
  if (!player) {
    setTimeout(() => setPlayer, 100);
  }
  const video = document.getElementsByTagName("VIDEO")[0];
  video.addEventListener("playing", () => {
    setTimeout(() => skipAd(), 250);
  });

  const playerObserver = new MutationObserver(playerCallback);
  playerObserver.observe(player, observerConfig);
};

setPlayer();
