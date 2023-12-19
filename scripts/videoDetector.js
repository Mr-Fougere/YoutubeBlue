const adsSkipper = new AdsSkipper();
const resolutionReducer = new ResolutionReducer();
const actionIntegrer = new ActionIntegrer();
let moviePlayer = null;
let videoPlayer = null;
let previousURL = null;
let bind = false;

const config = {
  childList: true,
  subtree: true,
};

const checkBackgrounStatus = () => {
  return new Promise((resolve, reject) => {
    browser.runtime
      .sendMessage({ action: "backgroundStatus" })
      .then((response) => {
        resolve(response.status);
      })
      .catch(() => {
        setTimeout(() => {
          checkBackgrounStatus().then((status) => {
            resolve(status);
          });
        }, 1000);
      });
  });
};

const bindService = () => {
  checkBackgrounStatus().then((status) => {
    if (status == "ready" && videoPlayer && moviePlayer) {
      adsSkipper.setPlayers(moviePlayer, videoPlayer);
      resolutionReducer.setListeners(moviePlayer, videoPlayer);
      actionIntegrer.integrateButtons(
        adsSkipper,
        resolutionReducer,
        videoPlayer
      );
      bind = true;
    }
  });
};

const setupVariables = (player) => {
  if (!player) return;

  moviePlayer ||= player;
  videoPlayer ||= player.querySelector("VIDEO.video-stream.html5-main-video");

  if (previousURL != window.location.href) {
    previousURL = window.location.href;
    if (bind && document.hasFocus()) resolutionReducer.changeVideoLastResolution();
    if (previousURL.includes("youtube.com/watch?v=") && !bind) {
      bindService();
    }
  }
};

const mutationCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    if (mutation.target.id == "movie_player") {
      setupVariables(mutation.target);
    }
    if (mutation.target.classList == "video-ads ytp-ad-module") {
      adsSkipper.skipAd();
    }
  }
};

const obs = new MutationObserver(mutationCallback);
obs.observe(document, config);
setupVariables(document.getElementById("movie_player"));
