const videoPlayer = {
  _value: null,

  get value() {
    return this._value;
  },

  set value(newValue) {
    if (newValue !== this._value) {
      this._value = newValue;
      this.onUpdate(newValue);
    }
  },

  onUpdate(newValue) {
    integrateButtons(newValue);
    updaterBlurListeners();
  },
};

const handleNewVideo = (videoElement) => {
  if (!videoElement) return;
  if (videoPlayer.value) return;
  videoPlayer.value = videoElement;
};

const config = {
  childList: true,
  subtree: true,
};

const mutationCallback = (mutationsList, _observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLVideoElement) {
          handleNewVideo(node);
        }
      });
    }
  }
};

const obs = new MutationObserver(mutationCallback);

obs.observe(document.body, config);

handleNewVideo(document.querySelector("VIDEO.video-stream.html5-main-video"));
