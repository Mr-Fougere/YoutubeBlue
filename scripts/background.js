const DATABASE_NAME = "youSkip";
const MONTH_RECAP_TABLE_NAME = "monthRecap";

const dataBasePromise = indexedDB.open(DATABASE_NAME, 1);
let dataBase, skipsData;

const createMonthRecapTable = (db) => {
  if (!db.objectStoreNames.contains(MONTH_RECAP_TABLE_NAME)) {
    const skipTable = db.createObjectStore(MONTH_RECAP_TABLE_NAME, {
      keyPath: "id",
      autoIncrement: true,
    });
    skipTable.createIndex("typeIndex", "type", { unique: false });
    skipTable.createIndex("monthIndex", "month", { unique: false });
    skipTable.createIndex("countIndex", "count", { unique: false });
    skipTable.createIndex("timeIndex", "time", { unique: false });
  }
};

dataBasePromise.onupgradeneeded = function () {
  dataBase = dataBasePromise.result;
  createMonthRecapTable(dataBase);
};

dataBasePromise.onsuccess = function () {
  dataBase = dataBasePromise.result;
  nourrishData();
};

const nourrishData = () => {
  const informations = fetchSkipInformations();

  informations.then((response) => {
    skipsData = response;
  });
};

dataBasePromise.onerror = function () {
  console.error(dataBasePromise.error);
};

const getMonthRecap = (object) => {
  if (!dataBase && !object) return Promise.reject("Invalid parameters");

  const currentMonth = new Date().getMonth();

  return new Promise((resolve, reject) => {
    const transaction = dataBase.transaction(
      [MONTH_RECAP_TABLE_NAME],
      "readonly"
    );
    const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);
    const index = objectStore.index("monthIndex");
    const request = index.openCursor(IDBKeyRange.only(currentMonth));

    request.onsuccess = function (e) {
      const cursor = e.target.result;
      const objectType = object.skippable ? "skippable" : "unskippable";

      if (cursor) {
        const cursorValue = cursor.value;

        if (cursorValue.type === objectType) {
          resolve(cursorValue);
        } else {
          cursor.continue();
        }
      } else {
        resolve(null);
      }
    };

    request.onerror = function (e) {
      console.error(e.target.error);
      reject(null);
    };
  });
};

const updateMonthRecap = (monthRecap, object) => {
  if (!dataBase && !monthRecap && !object) return;

  return new Promise((resolve, reject) => {
    const transaction = dataBase.transaction(
      [MONTH_RECAP_TABLE_NAME],
      "readwrite"
    );
    const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);

    const updatedMonthRecap = {
      ...monthRecap,
      count: monthRecap.count + 1,
      time: monthRecap.time + object.duration,
    };

    const updateRequest = objectStore.put(updatedMonthRecap);

    updateRequest.onsuccess = function () {
      resolve();
    };

    updateRequest.onerror = function () {
      reject(null);
    };
  });
};

const createMonthRecap = (object) => {
  return new Promise((resolve, reject) => {
    const transaction = dataBase.transaction(
      [MONTH_RECAP_TABLE_NAME],
      "readwrite"
    );
    const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);
    const currentMonth = new Date().getMonth();
    const newSkip = {
      month: currentMonth,
      type: object.skippable ? "skippable" : "unskippable",
      count: 1,
      time: object.duration,
    };

    const skipRequest = objectStore.add(newSkip);

    skipRequest.onsuccess = function () {
      resolve();
    };

    skipRequest.onerror = function () {
      reject(null);
    };
  });
};

const updateCurrentMonthRecap = (object) => {
  if (!object && !dataBase) return;

  getMonthRecap(object).then((monthRecap) => {
    if (monthRecap) {
      updateMonthRecap(monthRecap, object).then(() => {
        nourrishData();
      });
    } else {
      createMonthRecap(object).then(() => {
        nourrishData();
      });
    }
  });
};

const fetchSkipInformations = () => {
  if (!dataBase) return;

  return new Promise((resolve, reject) => {
    const transaction = dataBase.transaction(
      [MONTH_RECAP_TABLE_NAME],
      "readonly"
    );
    const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);
    const dataRequest = objectStore.getAll();

    dataRequest.onsuccess = function () {
      resolve(dataRequest.result);
    };

    dataRequest.onerror = function () {
      reject(null);
    };
  });
};

const monthlyFormat = (data, month) => {
  if (data.length === 0)
    return {
      unskippableCount: 0,
      skippableCount: 0,
    };

  const monthData = data.filter((item) => item.month === month);
  const unskippableData = monthData.find((item) => item.type === "unskippable");
  const skippableData = monthData.find((item) => item.type === "skippable");
  const unskippableCount = unskippableData ? unskippableData.count : 0;
  const skippableCount = skippableData ? skippableData.count : 0;

  return {
    unskippableCount,
    skippableCount,
  };
};

const generalFormat = (data) => {
  let count = 0;
  let time = 0;

  data.forEach((element) => {
    count += element.count;
    time += element.time;
  });

  const averageAdsTime = Math.round(time / count) || 0;

  return {
    averageAdsTime,
    count,
    time,
  };
};

const formatData = (data, month) => {
  if (month) return monthlyFormat(data, month);
  return generalFormat(data);
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "newSkip") {
    updateCurrentMonthRecap(request);
  }

  if (request.action == "fetchInformations") {
    sendResponse(formatData(skipsData, request.month));
  }

  if (request.action == "getFeatureState") {
    sendResponse(localStorage.getItem(request.name) === "true");
  }

  if (request.action == "setFeatureState") {
    localStorage.setItem(request.name, request.state);
  }
});
