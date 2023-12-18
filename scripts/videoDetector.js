const adsSkipper = new AdsSkipper();
const resolutionReducer = new ResolutionReducer();
const actionIntegrer = new ActionIntegrer();
let mainPlayer;
const ADS_CLASSES = "ytp-ads-button ytp-button";

let built = false;
const config = {
  childList: true,
  subtree: true,
};

const setMainPlayer = async () => {
  let mainPlayerTries = 0;
  return new Promise((resolve, reject) => {
    setInterval(() => {
      mainPlayerTries++;
      mainPlayer = document.querySelector("DIV#player");
      if (mainPlayer) {
        resolve(mainPlayer);
      }
      if (mainPlayerTries > 50) reject();
    }, 100);
  });
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

const buildService = (node) => {
  console.log(node);
  if (built) return;
  if (!node) return;
  if (node.parentNode.parentNode.id != "movie_player") return;

  checkBackgrounStatus().then((status) => {
    if (status == "ready") {
      actionIntegrer.integrateButtons(adsSkipper, resolutionReducer, node);
      adsSkipper.setPlayers(mainPlayer, node);
      resolutionReducer.setListeners(mainPlayer, node);
      node.addEventListener("playing", adsSkipper.skipAd);
      built = true;
    }
  });
  if (built) return;

  setTimeout(() => {
    buildService(node);
  }, 1000);
};

const mutationCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLVideoElement) {
          buildService(node);
        }
        if (node instanceof HTMLElement) {
          if (node.classList.value == ADS_CLASSES) {
            adsSkipper.skipAd();
          }
        }
      });
    }
  }
};

const setup = async () => {
  const obs = new MutationObserver(mutationCallback);
  mainPlayer = await setMainPlayer();
  obs.observe(mainPlayer, config);
  buildService(mainPlayer.querySelector("VIDEO.video-stream.html5-main-video"));
};

setup();
