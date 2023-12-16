let allData;
const dataInjector = new DataInjector();
const dataFormatter = new DataFormatter();
const dbEngine = new SetupDataBase();

const setup = async () => {
  try {
    await dbEngine.openDB();
    await dbEngine.createTables();
    await pullItems();
    setMessageListeners();
  } catch (error) {
    console.error(error);
  } finally {
    dbEngine.closeDB();
  }
};

const pullItems = async () => {
  dbEngine.openDB().then(async () => (allData = await dbEngine.getAllItems()));
};

const setMessageListeners = () => {
  browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log(request);

    if (request.action == "newInjection") {
      dataInjector.openDB().then(() => {
        dataInjector.add(request.data).then(() =>
          pullItems().then(() => {
            dataInjector.closeDB();
          })
        );
      });
    }

    if (request.action == "fetchInformations") {
      sendResponse(dataFormatter.popupFormat(allData));
    }

    if (request.action == "getFeatureState") {
      sendResponse(localStorage.getItem(request.name) === "true");
    }

    if (request.action == "setFeatureState") {
      localStorage.setItem(request.name, request.state);
    }
  });
};

setup();
