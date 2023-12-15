const totalSkipCount = document.getElementById("total-skip-count");
const totalSkipTime = document.getElementById("total-skip-time");
const monthUnskippableCount = document.getElementById(
  "month-unskippable-count"
);
const monthSkippableCount = document.getElementById("month-skippable-count");
const averageTime = document.getElementById("average-ads-time");
const errorDisplay = document.getElementById("error-flash");
const versionName = document.getElementById("version-name");

const features = ["ads-skipper", "resolution-blur"];

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

const updateTabs = (name, state) => {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    tabs
      .filter((tab) => tab.url.includes("youtube.com/watch?v="))
      .forEach((tab) => {
        browser.tabs.sendMessage(tab.id, {
          action: "updateFeatureState",
          name: name,
          state: state,
        });
      });
  });
};

const sendFeatureState = (name, state) => {
  browser.runtime.sendMessage({
    action: "setFeatureState",
    name: name,
    state: state,
  });

  updateTabs(name,state);
};

const featureActions = () => {
  features.forEach((feature) => {
    const featureElement = document.getElementById(feature);
    browser.runtime
      .sendMessage({
        action: "getFeatureState",
        name: featureElement.dataset.feature,
      })
      .then((response) => {
        featureElement.checked = response;
      });

    featureElement.addEventListener("change", (e) => {
      sendFeatureState(e.target.dataset.feature, e.target.checked);
    });
  });
};

const setVersionName = () => {
  versionName.textContent = "v" + browser.runtime.getManifest().version_name;
};

setVersionName();
featureActions();
fetchAllInformations();
fetchMonthInformations();
