const { db } = require("./db");

const postExercise = (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { description, date, duration } = req.body;
      const durationNumber = parseInt(req.body.duration);
  
      // Check for required fields
      if (!userId) {
        return res.status(400).json({
          status: 400,
          success: false,
          error: "User id is missing. Please provide valid user id.",
        });
      }

      if (!description) {
        return res.status(400).json({
          status: 400,
          success: false,
          error: "Description param is missing. Please provide valid exercise description.",
        });
      }

      if (!duration) {
        return res.status(400).json({
          status: 400,
          success: false,
          error: "Duration param is missing. Please provide valid exercise duration.",
        });
      }
  
      // Check if user exists in table
      db.get("SELECT * FROM Users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            success: false,
            error: "Internal Server Error",
          });
        }

        // User doesn't exist
        if (!row) {
          return res.status(400).json({
            status: 400,
            success: false,
            error: "User with provided id does not exist",
          });
        }

        // Check if duration is greater than zero
        if (!durationNumber || durationNumber <= 0) {
          return res.status(400).json({
            status: 400,
            success: false,
            error: "Duration must be a number greater than zero.",
          });
        }

        // Date validation
        const dateFormat = /^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
        let exerciseDate = date ? date : new Date().toISOString().slice(0, 10);

        if (!dateFormat.test(exerciseDate)) {
          return res.status(400).json({
            status: 400,
            success: false,
            error: "Invalid date format",
          });
        }
  
        // Insert new exercise
        db.run(
          "INSERT INTO Exercises(userId, description, duration, date) VALUES (?, ?, ?, ?)",
          [userId, description, durationNumber, exerciseDate],
          function (err) {
            if (err) {
              return res.status(500).json({
                status: 500,
                success: false,
                error: "Internal Server Error",
              });
            }
  
            // Return inserted exercise
            db.get(
              "SELECT * FROM Exercises WHERE id = ?",
              this.lastID,
              (err, row) => {
                if (err) {
                  return res.status(500).json({
                    status: 500,
                    success: false,
                    error: "Internal Server Error",
                  });
                }
  
                return res.status(200).json({
                  status: 200,
                  success: true,
                  data: {
                    exerciseId: row.id,
                    userId: row.userId,
                    description: row.description,
                    duration: row.duration,
                    date: row.date,
                  },
                });
              }
            );
          }
        );
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: "Bad Request",
      });
    }
};

const getLogs = (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // query params
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit || 100;

    if (!userId) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: "Invalid format of provided user id.",
      });
    }

    let countQuery = "SELECT COUNT(*) as count FROM Exercises WHERE userId = ?";
    let logsQuery = "SELECT * FROM Exercises WHERE userId = ?";

    const params = [userId];

    // If optional query params provided, include to sql query
    if (from && to) {
      const toDatePlusOne = new Date(
        new Date(to).getTime() + 24 * 60 * 60 * 1000
      );

      countQuery += " AND date BETWEEN ? AND ?";
      logsQuery += " AND date BETWEEN ? AND ?";

      params.push(from, toDatePlusOne.toISOString());
    } else if (from) {
      countQuery += " AND date >= ?";
      logsQuery += " AND date >= ?";

      params.push(from);
    } else if (to) {
      const toDatePlusOne = new Date(
        new Date(to).getTime() + 24 * 60 * 60 * 1000
      );

      countQuery += " AND date <= ?";
      logsQuery += " AND date <= ?";

      params.push(toDatePlusOne.toISOString());
    }

    db.get(countQuery, params, (err, countRow) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          success: false,
          error: "Internal Server Error",
        });
      }

      if (!countRow) {
        return res.status(404).json({
          status: 404,
          success: false,
          error: "No logs found for user",
        });
      }

      const totalCount = countRow.count;

      // Descending order
      logsQuery += " ORDER BY date ASC LIMIT ?";
      params.push(limit);

      db.all(logsQuery, params, (err, rows) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            success: false,
            error: "Internal Server Error",
          });
        }

        db.get("SELECT * FROM Users WHERE id = ?", userId, (err, user) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              success: false,
              error: "Internal Server Error",
            });
          }

          // Return error if user with provided id does not exist
          if (!user) {
            return res.status(404).json({
              status: 404,
              success: false,
              error: "User with provided id was not found.",
            });
          }

          const logs = rows.map((log) => {
            return {
              id: log.ID,
              description: log.description,
              duration: log.duration,
              date: log.date,
            };
          });

          const responseData = {
            id: user.id,
            username: user.username,
            count: totalCount,
            log: logs,
          };

          return res.status(200).json({
            status: 200,
            success: true,
            data: responseData,
          });
        });
      });
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      success: false,
      error: "Bad Request",
    });
  }
};

module.exports = {
  postExercise,
  getLogs
}