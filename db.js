const sqlite = require("sqlite3").verbose();
let sql;

const db = new sqlite.Database("database.db", sqlite.OPEN_READWRITE, (err) => {
  // error
  if (err) {
    console.error("Error while establishing connection with database " + err.message);
  } else {
    // check if Users table exists
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='Users'",
      (err, row) => {
        if (err) {
          console.error("Error while checking if table exists: " + err.message);
        } else if (!row) {
          // If it doesn't exist, create one
          sql = "CREATE TABLE Users(id INTEGER PRIMARY KEY, username TEXT)";
          db.run(sql);
        }
      }
    );

    // check if Exercises table exists
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='Exercises'",
      (err, row) => {
        if (err) {
          console.error("Error while checking if table exists: " + err.message);
        } else if (!row) {
          // If it doesn't exist, create one
          sql = "CREATE TABLE Exercises(id INTEGER PRIMARY KEY, userId INTEGER, description TEXT, duration INTEGER, date TEXT)";
          db.run(sql);
        }
      }
    );
  }
});

module.exports = { db };