const timeConverter = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const daysText = days > 0 ? days + ` day${days > 1 ? "s" : ""} ` : "";
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const hoursText = hours > 0 ? hours + ` hour${hours > 1 ? "s" : ""} ` : "";
  const minutes = Math.floor((seconds % 3600) / 60);
  const minutesText =
    minutes > 0 ? minutes + ` minute${minutes > 1 ? "s" : ""} ` : "";
  const remainingSeconds = seconds % 60;
  const secondsText = remainingSeconds + " seconds";
  return daysText + hoursText + minutesText + secondsText;
};

browser.runtime
  .sendMessage({ action: "skipInformations" })
  .then(function (response) {
    const youSkipCount = response.youSkipCount;
    const youSkipTimeSkipped = response.youSkipTimeSkipped;
    document.getElementById("skip-count").textContent = youSkipCount;
    document.getElementById("total-skip-time").textContent =
      timeConverter(youSkipTimeSkipped);
  });
