const totalSkipCount = document.getElementById("total-skip-count");
const totalSkipTime = document.getElementById("total-skip-time");
const monthUnskippableCount = document.getElementById(
  "month-unskippable-count"
);
const monthSkippableCount = document.getElementById("month-skippable-count");
const averageTime = document.getElementById("average-ads-time");
const errorDisplay = document.getElementById("error-flash");
const adsSkipper = document.getElementById("ads-skipper");
const versionName = document.getElementById("version-name");

const timeConverter = (seconds) => {
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours + "h " + minutes + "m " + remainingSeconds + "s ";
};

const fetchInformation = (month = null) => {
  return new Promise((resolve, reject) => {
    browser.runtime
      .sendMessage({
        action: "fetchInformations",
        month: month,
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchAllInformations = () => {
  fetchInformation()
    .then((response) => {
      const { time, averageAdsTime, count } = response;

      totalSkipCount.textContent = count;
      totalSkipTime.textContent = timeConverter(time);
      averageTime.textContent = averageAdsTime + "s";
    })
    .catch(() => {
      console.log(e);
      errorDisplay.textContent = "An error occurred while fetching data";
    });
};

const fetchMonthInformations = () => {
  const currentMonth = new Date().getMonth();
  fetchInformation(currentMonth)
    .then((response) => {
      const { unskippableCount, skippableCount } = response;

      monthUnskippableCount.textContent = unskippableCount;
      monthSkippableCount.textContent = skippableCount;
    })
    .catch((e) => {
      console.log(e);
      errorDisplay.textContent = "An error occurred while fetching data";
    });
};

const sendFeatureState = (name, state) => {
  browser.runtime.sendMessage({
    action: "setFeatureState",
    name: name,
    state: state,
  });
};

const featureActions = () => {
  browser.runtime
    .sendMessage({ action: "getFeatureState", name: "adsSkipper" })
    .then((response) => {
      adsSkipper.checked = response;
    });

  adsSkipper.addEventListener("click", (e) => {
    sendFeatureState("adsSkipper", e.target.checked);
  });
};

const setVersionName = () => {
  versionName.textContent = "v" + browser.runtime.getManifest().version_name;
};

setVersionName();
featureActions();
fetchAllInformations();
fetchMonthInformations();
