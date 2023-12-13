const DATABASE_NAME = "youSkip";
const SKIP_TABLE_NAME = "skips";

const dataBase = indexedDB.open(DATABASE_NAME, 1);

dataBase.onupgradeneeded = function (event) {
  const db = event.target.result;

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

dataBase.onsuccess = function (event) {
  const _db = event.target.result;
};

function addSkip(db, objet) {
  const transaction = db.transaction([SKIP_TABLE_NAME], "readwrite");
  const objectStore = transaction.objectStore(SKIP_TABLE_NAME);

  const newSkip = {
    time: new Date(),
    type: objet.type || "skippable",
    duration: objet.duration || 5,
  };

  const addRequest = objectStore.add(newSkip);

  addRequest.onsuccess = function () {
    console.log("Objet ajouté avec succès.");
  };

  addRequest.onerror = function () {
    console.error("Erreur lors de l'ajout de l'objet:", addRequest.error);
  };
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "newSkip") {
    const skip = request.skip;
    addSkip(dataBase, skip);
  }

  if( request.action = "fetchGlobalInformations"){

  }

  if( request.action == "fetchMonthInformtions"){

  }
});
