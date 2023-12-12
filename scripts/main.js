const player = document.getElementById("player");
const observerConfig = { childList: true, subtree: true };
const skipCountName = "youSkipCount";
const targetMutationClassList = "video-ads ytp-ad-module";
const skipButtonClassList = "ytp-ad-skip-button-slot";

const playerCallback = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.classList.value != targetMutationClassList) break;

    const adPlayer = document.getElementsByClassName(
      "ytp-ad-player-overlay-skip-or-preview"
    )[0];
    const skipButton = adPlayer.firstChild.lastChild;
    if (skipButton.classList.value != skipButtonClassList) break;
    skipButton.click();
    addNewSkip();
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

const playerObserver = new MutationObserver(playerCallback);
playerObserver.observe(player, observerConfig);
