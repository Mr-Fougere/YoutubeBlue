class DataInjector extends DatabaseEngine {
  constructor() {
    super();
    this.currentMonth = new Date().getMonth();
    this.dataTable;
  }

  _retrieveCorrespondTable(data) {
    if (data.duration) {
      return "monthSkip";
    } else if (data.data) {
      return "monthBlur";
    }
  }

  _retrieveCorrespondItem(data) {
    (data);
    ("retrieve");
    this.dataTable = this._retrieveCorrespondTable(data);

    return new Promise((resolve, reject) => {
      this.getItems(this.dataTable, "month", this.currentMonth)
        .then((monthItems) => {
          (monthItems);
          if(monthItems.length == 0) resolve(null);
          for (const item of monthItems) {
            (item);
            (data);
            if (
              this.dataTable === "monthSkip" &&
              item.skippable === data.skippable
            ) {
              resolve(item);
            } else if (
              this.dataTable === "monthBlur" &&
              item.resolution === data.resolution
            ) {
              resolve(item);
            }
          }
          resolve(null);
        })
        .catch((e) => {
          console.error(e);
          resolve(null);
        });
    });
  }

  _adsSkipUpdate(adsSkip, object) {
    return {
      ...adsSkip,
      count: adsSkip.count + 1,
      time: adsSkip.time + object.duration,
    };
  }

  _blurTimeUpdate(blurTime, object) {
    return {
      ...blurTime,
      data: blurTime.data + object.data,
      time: blurTime.time + object.time,
    };
  }

  _updateExistingItem(corresponItem, object) {
    return new Promise((resolve, reject) => {
      const _updateItem = () => {
        (this.dataTable);
        switch (this.dataTable) {
          case "monthSkip":
            return this._adsSkipUpdate(corresponItem, object);
          case "monthBlur":
            return this._blurTimeUpdate(corresponItem, object);
        }
      };

      this.updateItem(corresponItem.id, _updateItem(), this.dataTable)
        .then(() => {
          ("updated");
          resolve();
        })
        .catch(() => {
          console.error(e);
          reject();
        });
    });
  }

  _newBlurTime(object) {
    return {
      month: this.currentMonth,
      resolution: object.resolution,
      data: object.data,
      time: object.time,
    };
  }

  _newAdsSkip(object) {
    return {
      month: this.currentMonth,
      skippable: object.skippable,
      count: 1,
      time: object.duration,
    };
  }

  _createItem(object) {
    (object);
    return new Promise((resolve, reject) => {
      const newItem = () => {
        switch (this.dataTable) {
          case "monthSkip":
            return this._newAdsSkip(object);
          case "monthBlur":
            return this._newBlurTime(object);
        }
      };
      (newItem());
      this.addItem(newItem(), this.dataTable)
        .then(() => {
          resolve();
        })
        .catch((e) => {
          console.error(e);
          reject();
        });
    });
  }

  add(data) {
    (data, this.db);
    if (!data && !this.db) return;

    ("adding data");

    return new Promise((resolve, reject) => {
      this._retrieveCorrespondItem(data)
        .then((corresponItem) => {
          (corresponItem);
          if (corresponItem) {
            ("updating existing item");
            this._updateExistingItem(corresponItem, data).then(() => {
              resolve();
            });
          } else {
            ("creating new item");
            this._createItem(data).then(() => {
              ("created");
              resolve();
            });
          }
        })
        .catch((e) => {
          console.error(e);
          reject();
        });
    });
  }
}
