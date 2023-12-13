let currentStorageVersion = "lite";

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

const isAdvanced = (version) => {
  return version === "advanced";
};

const fetchGeneralInformations = () => {
  browser.runtime
    .sendMessage({
      action: "fetchGeneralInformations",
      version: currentStorageVersion,
    })
    .then(function (response) {
      const totalSkipCount = document.getElementById("total-skip-count");
      const totalSkipTime = document.getElementById("total-skip-time");
      const { count, time } = response;
      totalSkipCount.textContent = count;
      totalSkipTime.textContent = timeConverter(time);
    });
};

const fetchMonthInformations = () => {
  browser.runtime
    .sendMessage({
      action: "fetchMonthInformations",
      version: currentStorageVersion,
    })
    .then(function (response) {
      const monthUnskippableCount = document.getElementById(
        "month-unskippable-count"
      );
      const monthSkippableCount = document.getElementById(
        "month-skippable-count"
      );
      const monthSkipTime = document.getElementById("month-skip-time");
      const monthAverageTime = document.getElementById("month-average-time");
      const { unskippableCount, skippableCount, time, averageUnskippableTime } = response;

      monthUnskippableCount.textContent = unskippableCount;
      monthSkippableCount.textContent = skippableCount;
      monthSkipTime.textContent = timeConverter(time);
      monthAverageTime.textContent = timeConverter(averageUnskippableTime);
    });
};

browser.runtime
  .sendMessage({ action: "getStorageVersion" })
  .then((response) => {
    currentStorageVersion = response;
    const storageValue = document.getElementById("storage-version");
    storageValue.checked = isAdvanced(currentStorageVersion);
    fetchGeneralInformations();
    fetchMonthInformations();
    storageValue.addEventListener("change", (event) => {
      const newStorageVersion = event.target.checked ? "advanced" : "lite";
      browser.runtime.sendMessage({
        action: "setStorageVersion",
        value: newStorageVersion,
      });
      currentStorageVersion = newStorageVersion;
    });
  });
