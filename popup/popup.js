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
let currentStorageVersion = "lite";

const fetchInformations = () => {
  browser.runtime
    .sendMessage({
      action: "fetchGeneralInformations",
      version: currentStorageVersion,
    })
    .then(function (response) {
      const totalSkipCount = document.getElementById("total-skip-count");
      const totalSkipTime = document.getElementById("total-skip-time");
      const monthUnskippableCount = document.getElementById("month-unskippable-count");
      const monthSkippableCount = document.getElementById("month-skippable-count");

      if (currentStorageVersion === "lite") {
        const { count, time } = response;
        totalSkipCount.textContent = count;
        totalSkipTime.textContent = timeConverter(time);
      } else {
        const { skippable, unskippable } = response;
        const count = skippable.length + unskippable.length;
        const time = skippable.reduce((acc, curr) => acc + curr.duration, 0);
      }
    });
};

browser.runtime
  .sendMessage({ action: "getStorageVersion" })
  .then((response) => {
    currentStorageVersion = response;
    const storageValue = document.getElementById("storage-version");
    storageValue.checked = isAdvanced(currentStorageVersion);
    fetchInformations();
    storageValue.addEventListener("change", (event) => {
      const newStorageVersion = event.target.checked ? "advanced" : "lite";
      browser.runtime.sendMessage({
        action: "setStorageVersion",
        value: newStorageVersion,
      });
      currentStorageVersion = newStorageVersion;
    });
  });
