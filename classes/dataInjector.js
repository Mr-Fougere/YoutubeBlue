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
    this.dataTable = this._retrieveCorrespondTable(data);

    return new Promise((resolve, reject) => {
      this.getItems(this.dataTable, "month", this.currentMonth)
        .then((monthItems) => {
          if(monthItems.length == 0) resolve(null);
          for (const item of monthItems) {
            console.log(item);
            console.log(data);
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
      data: adsSkip.count + object.data,
      time: adsSkip.time + object.time,
    };
  }

  _blurTimeUpdate(blurTime, object) {
    return {
      ...blurTime,
      count: blurTime.count + 1,
      time: blurTime.time + object.duration,
    };
  }

  _updateExistingItem(corresponItem, object) {
    return new Promise((resolve, reject) => {
      const _updateItem = () => {
        switch (this.dataTable) {
          case "monthSkip":
            return this._adsSkipUpdate(corresponItem, object);
          case "monthBlur":
            return this._blurTimeUpdate(corresponItem, object);
        }
      };

      this.updateItem(corresponItem.id, _updateItem, this.dataTable)
        .then(() => {
          resolve();
        })
        .catch(() => {
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
    console.log(object);
    return new Promise((resolve, reject) => {
      const newItem = () => {
        switch (this.dataTable) {
          case "monthSkip":
            return this._newAdsSkip(object);
          case "monthBlur":
            return this._newBlurTime(object);
        }
      };
      console.log(newItem());
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
    console.log(data, this.db);
    if (!data && !this.db) return;

    console.log("adding data");

    return new Promise((resolve, reject) => {
      this._retrieveCorrespondItem(data)
        .then((corresponItem) => {
          console.log(corresponItem);
          if (corresponItem) {
            console.log("updating existing item");
            this._updateExistingItem(corresponItem, data).then(() => {
              resolve();
            });
          } else {
            this._createItem(data).then(() => {
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
