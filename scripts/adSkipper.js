const observerConfig = { childList: true, subtree: true };
const skipCountName = "youSkipCount";
const targetMutationClassList = "video-ads ytp-ad-module";
const skipButtonClassList = "ytp-ad-skip-button-slot";
const resolutionStorageName = "youSkipResolutionIndex";
const DEFAULT_AD_TIME = 5; // in seconds
let videoTryCount = 0;
let playerTryCount = 0;

const forwardAdVideo = () => {
  const video = document.getElementsByTagName("VIDEO")[0];
  video.currentTime = video.duration;
  video.play();
  return { videoDuration: Math.round(video.duration) };
};

const skipAd = () => {
  const adPlayer = document.getElementsByClassName(
    "ytp-ad-player-overlay-skip-or-preview"
  )[0];
  if (!adPlayer) return;
  const { videoDuration } = forwardAdVideo();

  const skipButton = adPlayer.firstChild.lastChild;

  const skippableAd = skipButton.classList.value == skipButtonClassList;

  addNewSkip(skippableAd ? DEFAULT_AD_TIME : videoDuration);
};

const playerCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.classList.value != targetMutationClassList) break;
    skipAd();
  }
};

const addNewSkip = (time) => {
  browser.runtime.sendMessage({
    action: "newSkip",
    value: time,
  });
};

const setPlayer = () => {
  const player = document.getElementById("player");
  if (!player) {
    if (playerTryCount > 10) return;
    playerTryCount++;
    setTimeout(() => setPlayer, 100);
  }

  const video = document.getElementsByTagName("VIDEO")[0];
  if (!video) {
    if (videoTryCount > 10) return;
    videoTryCount++;
    setTimeout(() => setPlayer, 100);
  }

  video.addEventListener("playing", () => setTimeout(() => skipAd(), 250));

  const playerObserver = new MutationObserver(playerCallback);
  playerObserver.observe(player, observerConfig);
};

setPlayer();
