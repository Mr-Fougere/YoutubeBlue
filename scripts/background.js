const DATABASE_NAME = "youSkip";
const MONTH_RECAP_TABLE_NAME = "monthRecap";

const dataBasePromise = indexedDB.open(DATABASE_NAME, 1);
let dataBase, skipsData;

const createMonthRecapTable = (db) => {
  if (!db.objectStoreNames.contains(MONTH_RECAP_TABLE_NAME)) {
    console.log(db);
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
  const informations = fetchSkipInformations();

  informations.then((response) => {
    skipsData = response;
  });
};

dataBasePromise.onerror = function () {
  console.error(dataBasePromise.error);
};

const getMonthRecap = (month) => {
  if (!dataBase && !month) return;

  return new Promise((resolve, reject) => {
    const transaction = dataBase.transaction(
      [MONTH_RECAP_TABLE_NAME],
      "readwrite"
    );
    const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);
    const dataRequest = objectStore.index("monthIndex").openCursor(month);

    dataRequest.onsuccess = function (e) {
      console.log(e.target.result);
      const result = e.target.result;
      resolve(result);
    };

    dataRequest.onerror = function (e) {
      console.error(e.target.error);
      reject(null);
    };
  });
};

const updateMonthRecap = (monthRecap, object) => {
  if (!dataBase && !monthRecap && !object) return;

  const transaction = dataBase.transaction(
    [MONTH_RECAP_TABLE_NAME],
    "readwrite"
  );
  const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);

  const updatedMonthRecap = {
    ...monthRecap,
    count: monthRecap.count + 1,
    time: monthRecap.time + object.time,
  };

  const updateRequest = objectStore.put(updatedMonthRecap);

  updateRequest.onsuccess = function () {
    const getRequest = objectStore.get(updatedMonthRecap.id);
    console.log(updateRequest.result);
  };
};

const createMonthRecap = (object) => {
  const transaction = dataBase.transaction(
    [MONTH_RECAP_TABLE_NAME],
    "readwrite"
  );
  const objectStore = transaction.objectStore(MONTH_RECAP_TABLE_NAME);

  const newSkip = {
    month: new Date().getMonth(),
    type: object.skippable ? "skippable" : "unskippable",
    count: 1,
    time: object.duration,
  };

  const skipRequest = objectStore.add(newSkip);

  skipRequest.onsuccess = function () {
    const newIndex = skipRequest.result;
    const getRequest = objectStore.get(newIndex);
    getRequest.onsuccess = function () {
      const result = getRequest.result;
    };
  };
};

const updateCurrentMonthRecap = (object) => {
  if (!object && !dataBase) return;

  getMonthRecap(new Date().getMonth()).then((monthRecap) => {
    let updatedMonthRecap = null;
    if (monthRecap) {
      updatedMonthRecap = updateMonthRecap(monthRecap, object);
    } else {
      updatedMonthRecap = createMonthRecap(object);
    }
    console.log(updatedMonthRecap);
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

    dataRequest.onsuccess = function (e) {
      const result = e.target.result;
      resolve(result);
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
  const unskippableCount = monthData.filter(
    (item) => item.type === "unskippable"
  ).count;
  const skippableCount = monthData.filter(
    (item) => item.type === "skippable"
  ).count;
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

browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action == "newSkip") {
    updateCurrentMonthRecap(request);
  }

  if (request.action == "fetchInformations") {
    sendResponse(formatData(skipsData, request.month));
  }

  if (request.action == "updateFeatureStatus") {
    console.log(request);
  }
});
