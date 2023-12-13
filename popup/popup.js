const AD_TIME = 5; // in seconds

const timeConverter = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const daysText = days > 0 ? days + ` day${days > 1 ? "s" : ""} ` : "";
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const hoursText = hours > 0 ? hours + ` hours${hours > 1 ? "s" : ""} ` : "";
  const minutes = Math.floor((seconds % 3600) / 60);
  const minutesText =
    minutes > 0 ? minutes + ` minutes${minutes > 1 ? "s" : ""} ` : "";
  const remainingSeconds = seconds % 60;
  const secondsText = remainingSeconds > 0 ? remainingSeconds + " seconds" : "";
  return daysText + hoursText + minutesText + secondsText;
};

browser.runtime
  .sendMessage({ action: "getYouSkipCount" })
  .then(function (response) {
    const youSkipCount = response.youSkipCount;
    document.getElementById("skip-count").textContent = youSkipCount;
    document.getElementById("total-skip-time").textContent = timeConverter(
      youSkipCount * AD_TIME
    );
  });
