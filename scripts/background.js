let allData;
const dataInjector = new DataInjector();
const dataFormatter = new DataFormatter();
const dbEngine = new SetupDataBase();
const blurManager =  new BlurManager();
let backgroundStatus = "not_ready"

const setup = async () => {
  try {
    await dbEngine.openDB();
    await dbEngine.createTables();
    await pullItems();
    setMessageListeners();
  } catch (error) {
    console.error(error)
  } finally {
    dbEngine.closeDB();
    backgroundStatus = 'ready';
  }
};

const pullItems = async () => {
  dbEngine.openDB().then(async () => (allData = await dbEngine.getAllItems()));
};

const setMessageListeners = () => {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

    if (request.action == "beginBlur") {
      if (["144p", "Auto"].includes(request.resolution)) return;
      const uuid = blurManager.newBlurTime(request.resolution, sender.tab.id);
      sendResponse({ uuid: uuid });
    }

    if (request.action == "endBlur") {
      blurManager.stopBlurTime(request.uuid);
    }

    if( request.action == "backgroundStatus"){
      sendResponse({status: backgroundStatus})
    }
  });
};

setup();
