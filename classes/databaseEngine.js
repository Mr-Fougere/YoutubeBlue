class DatabaseEngine {
  constructor() {
    this.dbName = "youSkip";;
    this.version = 1;
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.version = this.db.version;
        resolve();
      };

      request.onerror = (event) => {
        reject(
          `Erreur lors de l'ouverture de la base de données: ${event.target.error}`
        );
      };
    });
  }

  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async getItems(tableName, indexName, value) {
    return new Promise(async (resolve, reject) => {

      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      const transaction = this.db.transaction([tableName], "readonly");
      const store = transaction.objectStore(tableName);

      const index = store.index(indexName + "Index");
      const request = index.getAll(value);

      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        reject(
          `Erreur lors de la récupération de l'élément par index: ${event.target.error}`
        );
      };
    });
  }

  async getAllItems() {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      const transaction = this.db.transaction(
        this.db.objectStoreNames,
        "readonly"
      );
      let records = [];

      transaction.oncomplete = () => {
        resolve(records.flat( ));
      };

      transaction.onerror = (event) => {
        reject(
          `Erreur lors de la récupération des enregistrements: ${event.target.error}`
        );
      };

      Array.from(this.db.objectStoreNames).forEach((storeName) => {
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
          records.push(event.target.result);
        };
      });
    });
  }

  async addItem(item, tableName) {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      const transaction = this.db.transaction([tableName], "readwrite");
      const store = transaction.objectStore(tableName);

      const request = store.add(item);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject(`Erreur lors de l'ajout de l'élément: ${event.target.error}`);
      };
    });
  }

  async updateItem(itemId, updatedData, tableName) {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      const transaction = this.db.transaction([tableName], "readwrite");
      const store = transaction.objectStore(tableName);

      const getRequest = store.get(itemId);

      getRequest.onsuccess = () => {
        const existingItem = getRequest.result;
        if (existingItem) {
          Object.assign(existingItem, updatedData);
          const updateRequest = store.put(existingItem);

          updateRequest.onsuccess = () => {
            resolve(existingItem);
          };

          updateRequest.onerror = (event) => {
            reject(
              `Erreur lors de la mise à jour de l'élément: ${event.target.error}`
            );
          };
        } else {
          reject(`Aucun élément trouvé avec l'ID ${itemId}`);
        }
      };

      getRequest.onerror = (event) => {
        reject(
          `Erreur lors de la récupération de l'élément: ${event.target.error}`
        );
      };
    });
  }

  async deleteItem(itemId, tableName) {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      const transaction = this.db.transaction([tableName], "readwrite");
      const store = transaction.objectStore(tableName);

      const request = store.delete(itemId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(
          `Erreur lors de la suppression de l'élément: ${event.target.error}`
        );
      };
    });
  }

  async updateVersionAndCreateTable(tableName, indexDefinition) {
    return new Promise(async (resolve, reject) => {
      console.log(this.db);
      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      this.closeDB();

      this.version++;
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(tableName)) {
          const objectStore = db.createObjectStore(tableName, {
            keyPath: "id",
            autoIncrement: true,
          });

          if (indexDefinition) {
            for (const indexName in indexDefinition) {
              const indexProperties = indexDefinition[indexName];
              objectStore.createIndex(
                indexName + "Index",
                indexName,
                indexProperties
              );
            }
          }
        }else{
          this.version--;
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(
          `Erreur lors de la mise à jour de la version et de la création de la table: ${event.target.error}`
        );
      };
    });
  }
}
