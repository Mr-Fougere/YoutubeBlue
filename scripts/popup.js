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

const checkBackgrounStatus = () => {
  return new Promise((resolve, reject) => {
    browser.runtime
      .sendMessage({ action: "backgroundStatus" })
      .then((response) => {
        resolve(response.status);
      });
  });
};

const hideLoadingSpin = () => {
  const loadingSpins = document.querySelectorAll(".section-content-item-loading");
  loadingSpins.forEach((spin) => {
    spin.classList.add("hidden");
  });
}

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
      
      hideLoadingSpin();

      totalSkipCount.textContent = count;
      totalSkipTime.textContent = time;
      averageTime.textContent = averageAdsTime;
      monthUnskippableCount.textContent = unskippableCount;
      monthSkippableCount.textContent = skippableCount;
      monthBlurTime.textContent = blurTime;
      totalSavedData.textContent = dataSaved;

    })
    .catch((e) => {
      errorDisplay.textContent = e.message;
    });
};

const setVersionName = () => {
  versionName.textContent = "v" + browser.runtime.getManifest().version_name;
};

const launchFetching = () =>{
  checkBackgrounStatus().then((status) => {
    if (status == "ready") {
      fetchAllInformations();
    }
  });
  setTimeout(() => {
    launchFetching();
  }, 1000);
}

setVersionName();
launchFetching();
