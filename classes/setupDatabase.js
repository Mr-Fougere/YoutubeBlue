class SetupDataBase extends DatabaseEngine {
  constructor() {
    super();
  }
  
  TABLES = [
    {
      name: "monthSkip",
      config: {
        skippable: { unique: true },
        month: { unique: false },
        count: { unique: false },
        time: { unique: false },
      },
    },
    {
      name: "monthBlur",
      config: {
        resolution: { unique: true },
        month: { unique: false },
        time: { unique: false },
        data: { unique: false },
      },
    },
  ];

  async createTables() {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject("Base de données non ouverte");
        return;
      }

      for (const table of this.TABLES) {
        await this.updateVersionAndCreateTable(table.name, table.config);
      }
      resolve();
    });
  }
}
