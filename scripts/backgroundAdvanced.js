const DATABASE_NAME = "youSkip";
const SKIP_TABLE_NAME = "skips";
const dataBasePromise = indexedDB.open(DATABASE_NAME, 1);
let dataBase, generalSkipsData, monthSkipsData;

const createSkipTable = (db) => {
  if (!db.objectStoreNames.contains(SKIP_TABLE_NAME)) {
    const skipTable = db.createObjectStore(SKIP_TABLE_NAME, {
      keyPath: "id",
      autoIncrement: true,
    });
    skipTable.createIndex("timeIndex", "time", { unique: false });
    skipTable.createIndex("typeIndex", "type", { unique: false });
    skipTable.createIndex("durationIndex", "duration", { unique: false });
  }
};

const addSkip = (object) => {
  if (!object && !dataBase) return;
  const transaction = dataBase.transaction([SKIP_TABLE_NAME], "readwrite");
  const objectStore = transaction.objectStore(SKIP_TABLE_NAME);

  const newSkip = {
    time: new Date(),
    type: object.skippable ? "skippable" : "unskippable",
    duration: object.duration || 5,
  };

  objectStore.add(newSkip);
};

const fetchSkipInformations = (dateArray = []) => {
  if (!dataBase) return;

  return new Promise((resolve, reject) => {
    let skips = { skippable: [], unskippable: [] };
    const transaction = dataBase.transaction([SKIP_TABLE_NAME], "readonly");
    const objectStore = transaction.objectStore(SKIP_TABLE_NAME);
    const index = objectStore.index("timeIndex");

    let dateRange = null;

    if (dateArray.length != 0) {
      const startDate = dateArray[0];
      const endDate = dateArray[1];
      dateRange = IDBKeyRange.bound(startDate, endDate);
    }

    const dateCursorRequest = index.openCursor(dateRange);

    dateCursorRequest.onsuccess = function (e) {
      const result = e.target.result;
      if (result) {
        skips[result.value.type].push(result.value);
        result.continue();
      } else {
        const response = {
          skippable: skips.skippable,
          unskippable: skips.unskippable,
        };
        resolve(response);
      }
    };

    dateCursorRequest.onerror = function (e) {
      reject(skips);
    };
  });
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1);
};

const getLastDayOfMonth = (year, month) => {
  return new Date(year, month + 1, 0);
};

const buildCurrentMonthArray = () => {
  const currentDate = new Date();
  const firstDayCurrentMonth = getFirstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const lastDayOfCurrentMonth = getLastDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  return [firstDayCurrentMonth, lastDayOfCurrentMonth];
};

const formatGeneral = (data) => {
  const { skippable, unskippable } = data;
  const skippableTime = skippable.reduce(
    (acc, curr) => acc + curr.duration,
    0
  );
  const unskippableTime = unskippable.reduce(
    (acc, curr) => acc + curr.duration,
    0
  );
  const time = skippableTime + unskippableTime;
  const count = unskippable.length + skippable.length;
  return {
    count,
    time,
  };
};

const formatMonthly = (data) => {
  const { skippable, unskippable } = data;

  const skippableTime = skippable.reduce((acc, curr) => acc + curr.duration, 0);
  const unskippableTime = unskippable.reduce(
    (acc, curr) => acc + curr.duration,
    0
  );
  const unskippableCount = unskippable.length;
  const skippableCount = skippable.length;
  const time = skippableTime + unskippableTime;
  const averageUnskippableTime = unskippableTime / unskippable.length;

  return {
    unskippableCount,
    skippableCount,
    time,
    averageUnskippableTime,
  };  
};

dataBasePromise.onsuccess = function () {
  dataBase = dataBasePromise.result;
  createSkipTable(dataBase);

  const generalInformations = fetchSkipInformations();
  const monthInformations = fetchSkipInformations(buildCurrentMonthArray());

  generalInformations.then((response) => {
    generalSkipsData = response;
  });

  monthInformations.then((response) => {
    monthSkipsData = response;
  });
};

dataBasePromise.onerror = function () {
  console.error(dataBasePromise.error);
};

browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.version != "advanced") return;

  if (request.action == "newSkip") {
    addSkip(request);
  }

  if (request.action == "fetchGeneralInformations") {
    sendResponse(formatGeneral(generalSkipsData));
  }

  if (request.action == "fetchMonthInformations") {
    sendResponse(formatMonthly(monthSkipsData));
  }
});
