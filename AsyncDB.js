exports.AsyncDB = class AsyncDB {
    db
    /**
     * 
     * @param {import("sqlite3").Database} database The sqlite3 Database
     */
    constructor(database) {
        this.db = database
    }

    async getAsync(sql, params) {
        return new Promise((resolve, reject) => {
          this.db.get(sql, params, (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });
      }

    async allAsync(sql, params) {
        return new Promise((resolve, reject) => {
          this.db.all(sql, params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
      }
}