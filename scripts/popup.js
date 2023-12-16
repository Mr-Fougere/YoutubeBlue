const totalSkipCount = document.getElementById("total-skip-count");
const totalSkipTime = document.getElementById("total-skip-time");
const monthUnskippableCount = document.getElementById(
  "month-unskippable-count"
);
const monthSkippableCount = document.getElementById("month-skippable-count");
const averageTime = document.getElementById("average-ads-time");
const errorDisplay = document.getElementById("error-flash");
const monthBlurTime = document.getElementById("month-blur-time");
const totalSavedData = document.getElementById("data-saved");
const versionName = document.getElementById("version-name");

const fetchInformation = () => {
  return new Promise((resolve, reject) => {
    browser.runtime
      .sendMessage({
        action: "fetchInformations",
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
      if (!response) return;

      const {
        time,
        averageAdsTime,
        count,
        unskippableCount,
        skippableCount,
        blurTime,
        dataSaved,
      } = response;
      
      if (
        time == 0 &&
        averageAdsTime == 0 &&
        count == 0 &&
        blurTime == 0 &&
        dataSaved == 0
      )
        return;

      totalSkipCount.textContent = count;
      totalSkipTime.textContent = time;
      averageTime.textContent = averageAdsTime + "s";
      monthUnskippableCount.textContent = unskippableCount;
      monthSkippableCount.textContent = skippableCount;
      monthBlurTime.textContent = blurTime;
      totalSavedData.textContent = dataSaved;
    })
    .catch((e) => {
      console.log(e);
      errorDisplay.textContent = "An error occurred while fetching data";
    });
};

const setVersionName = () => {
  versionName.textContent = "v" + browser.runtime.getManifest().version_name;
};

setVersionName();
fetchAllInformations();
