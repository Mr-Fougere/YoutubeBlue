const timeConverter = (seconds) => {
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours + "h " + minutes + "m " + remainingSeconds + "s ";
};

const totalSkipCount = document.getElementById("total-skip-count");
const totalSkipTime = document.getElementById("total-skip-time");
const monthUnskippableCount = document.getElementById(
  "month-unskippable-count"
);
const monthSkippableCount = document.getElementById("month-skippable-count");
const averageTime = document.getElementById("average-ads-time");
const errorDisplay = document.getElementById("error-flash");

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
      errorDisplay.textContent = "An error occurred while fetching data";
    });
};

const fetchMonthInformations = () => {
  const currentMonth = new Date().getMonth();
  fetchInformation(currentMonth)
    .then((response) => {
      const { unskippableCount, skippableCount } = response;
      console.log(response);

      monthUnskippableCount.textContent = unskippableCount;
      monthSkippableCount.textContent = skippableCount;
    })
    .catch(() => {
      errorDisplay.textContent = "An error occurred while fetching data";
    });
};

fetchAllInformations();
fetchMonthInformations();
