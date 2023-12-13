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

const isLite = (version) => {
  return version === "lite";
};

browser.runtime
  .sendMessage({ action: "generalInformations" })
  .then(function (response) {
    const { count, time, storage } = response;
    const storageValue = document.getElementById("storage-version");
    const skipCount = document.getElementById("skip-count");
    const totalSkipTime = document.getElementById("total-skip-time");

    skipCount.textContent = count;
    totalSkipTime.textContent = timeConverter(time);
    storageValue.value = isLite(version);

    storageValue.addEventListener("change", (event) => {
      console.log(event.target.value);
    });
  });
