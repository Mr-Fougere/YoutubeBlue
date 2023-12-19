class AdsSkipper {
  ADS_MODULE_CLASSES = ".video-ads.ytp-ad-module";
  SKIPPABLE_CLASSES = "ytp-ad-skip-button-slot";
  DOUBLE_SKIP_BUTTON_CLASSES =
    "ytp-ad-skip-button-container ytp-ad-skip-button-container-detached";
  ADS_PREVIEW_CLASSES = ".ytp-ad-player-overlay-skip-or-preview";
  DEFAULT_AD_TIME = 5; // in seconds

  constructor() {
    this.active = false;
    this.player;
    this.videoPlayer;
    this.adModule;
  }

  setPlayers(player, videoPlayer) {
    this.player = player;
    this.videoPlayer = videoPlayer;
    this.adModule = player.querySelector(this.ADS_MODULE_CLASSES);
  }

  changeActiveStatus = (newStatus) => {
    this.active = newStatus;
    this.sendAdsSkipperStatus(newStatus);
    if(newStatus) this.skipAd();
  };

  forwardAdVideo = () => {
    this.videoPlayer.currentTime = this.videoPlayer.duration;
    this.videoPlayer.play();
    return { videoDuration: Math.round(this.videoPlayer.duration) };
  };

  checkDoubleSkipAd = () => {
    if (!this.adModule) return;
    const doubleSkipButton = this.adModule.getElementsByClassName(
      this.DOUBLE_SKIP_BUTTON_CLASSES
    )[0];
    if (!doubleSkipButton) return;

    doubleSkipButton.click();
  };

  addNewSkip = (skippable, duration) => {
    const message = {
      action: "newInjection",
      data: {
        duration: duration,
        skippable: skippable,
      },
    };
    browser.runtime
      .sendMessage(message)
      .catch(() =>
        setTimeout(() => this.addNewSkip(skippable, duration), 1000)
      );
  };

  sendAdsSkipperStatus = (state) => {
    browser.runtime
      .sendMessage({
        action: "setFeatureState",
        name: "adsSkipper",
        state: state,
      })
      .catch(() => setTimeout(() => this.sendAdsSkipperStatus(state), 1000));
  };

  skipAd = () => {
    if (!this.active) return;
    if (!this.player) return;
    if (!this.videoPlayer) return;

    if (!this.adModule) return;

    const adPlayer = this.adModule.querySelector(this.ADS_PREVIEW_CLASSES);
    if (!adPlayer) return;

    const { videoDuration } = this.forwardAdVideo();

    const skipButton = adPlayer.firstChild.lastChild;

    const skippableAd = skipButton.classList.value == this.SKIPPABLE_CLASSES;
    this.checkDoubleSkipAd();
    this.addNewSkip(
      skippableAd,
      skippableAd ? this.DEFAULT_AD_TIME : videoDuration
    );
  };
}
