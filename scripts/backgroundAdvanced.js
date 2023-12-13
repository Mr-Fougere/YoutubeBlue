const DATABASE_NAME = "youSkip";
const SKIP_TABLE_NAME = "skips";
const dataBasePromise = indexedDB.open(DATABASE_NAME, 1);
let dataBase;

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

const fetchSkipInformations = async (dateArray = []) => {
  if (!dataBase) return;

  return new Promise((resolve, reject) => {
    let skips = { skippable: [], unskippable: [] };
    const transaction = dataBase.transaction([SKIP_TABLE_NAME], "readonly");
    const objectStore = transaction.objectStore(SKIP_TABLE_NAME);
    const index = objectStore.index("dataIndex");

    var startDate = dateArray[0];
    var endDate = dateArray[1];

    var dateRange = IDBKeyRange.bound(startDate, endDate);

    var dateCursorRequest = dateIndex.openCursor(dateRange);

    dateCursorRequest.onsuccess = function (e) {
      const result = e.target.result;
      if (result) {
        skips[result.value.type].push(result.value);
        result.continue();
      } else {
        resolve(skips);
      }
    };

    dateCursorRequest.onerror = function (e) {
      reject(skips);
    };
  });
};

dataBasePromise.onsuccess = function () {
  dataBase = dataBasePromise.result;
  createSkipTable(dataBase);
};

dataBasePromise.onerror = function () {
  console.error(dataBasePromise.error);
};

browser.runtime.onMessage.addListener(
  async (request, _sender, sendResponse) => {
    if (request.version != "advanced") return;

    if (request.action == "newSkip") {
      addSkip(request);
    }

    if (request.action == "fetchGeneralInformations") {
      const { unskippableSkips, skippableSkips } =
        await fetchSkipInformations();
      console.log(unskippableSkips, skippableSkips);
    }

    if (request.action == "fetchMonthInformtions") {
      
      const { unskippableSkips, skippableSkips } =
        await fetchSkipInformations(request.dateArray);
      console.log(unskippableSkips, skippableSkips);
    }
  }
);
