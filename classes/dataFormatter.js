class DataFormatter {
  constructor() {
    this.data;
    this.currentMonth = new Date().getMonth();
  }

  timeConverter = (seconds) => {
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours + "h " + minutes + "m " + remainingSeconds + "s ";
  };

  dataConverter = (dataAmount, precision = 2) => {
    const megabyteThreshold = 1024;

    const gigabytes = dataAmount / megabyteThreshold;

    if (gigabytes >= 1) {
      return gigabytes.toFixed(precision) + " Go";
    } else {
      return dataAmount.toFixed(precision) + " Mo";
    }
  };

  popupFormat(data) {
    this.data = data;
    let formattedData = {
      unskippableCount: 0,
      skippableCount: 0,
      averageAdsTime: "0s",
      count: 0,
      time: "0h 0m 0s",
      dataSaved: 0,
      blurTime: "0h 0m 0s",
    };
    if (this.data.length == 0) return formattedData;

    formattedData.time = 0;
    formattedData.averageAdsTime = 0;
    formattedData.blurTime = 0;
    
    for (const item of this.data) {
      if (item.count) {
        formattedData.count += item.count;
        formattedData.time += item.time;
        if (item.month == this.currentMonth) {
          if (item.skippable) {
            formattedData.skippableCount = item.count;
          } else {
            formattedData.unskippableCount = item.count;
          }
        }
      } else if (item.data) {
        formattedData.dataSaved += item.data;
        if (item.month == this.currentMonth) {
          formattedData.blurTime += item.time;
        }
      }
    }

    formattedData.averageAdsTime =
    this.timeConverter(Math.round(formattedData.time / formattedData.count) || 0);
    formattedData.time = this.timeConverter(formattedData.time);
    formattedData.dataSaved = this.dataConverter(formattedData.dataSaved);
    formattedData.blurTime = this.timeConverter(formattedData.blurTime);

    return formattedData;
  }
}
