const observerConfig = { childList: true, subtree: true };
const skipCountName = "youSkipCount";
const targetMutationClassList = "video-ads ytp-ad-module";
const skipButtonClassList = "ytp-ad-skip-button-slot";
const resolutionStorageName = "youSkipResolutionIndex";

const unskippableAd = () => {
  const video = document.getElementsByTagName("VIDEO")[0];
  video.currentTime = video.duration;
  video.play();
};

const skipAd = () => {
  const adPlayer = document.getElementsByClassName(
    "ytp-ad-player-overlay-skip-or-preview"
  )[0];
  if (!adPlayer) return;
  const skipButton = adPlayer.firstChild.lastChild;
  if (skipButton.classList.value == skipButtonClassList) {
    skipButton.click();
  } else {
    unskippableAd();
  }
  addNewSkip();
};

const playerCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    console.log(mutation.target.classList.value);
    if (mutation.target.classList.value != targetMutationClassList) break;
    skipAd();
  }
};

const addNewSkip = () => {
  browser.runtime
    .sendMessage({ action: "getYouSkipCount" })
    .then(function (response) {
      var skipCount = response.youSkipCount;
      if (!skipCount) skipCount = 0;
      skipCount++;

      browser.runtime.sendMessage({
        action: "setYouSkipCount",
        value: skipCount,
      });
    });
};

const setPlayer = () => {
  const player = document.getElementById("player");
  console.log(player);
  if (!player) {
    setTimeout(() => setPlayer, 100);
  }
  const video = document.getElementsByTagName("VIDEO")[0];
  video.addEventListener("play", () => {
    console.log("play"), setTimeout(() => skipAd(), 250);
  });

  const playerObserver = new MutationObserver(playerCallback);
  playerObserver.observe(player, observerConfig);
};

setPlayer();
