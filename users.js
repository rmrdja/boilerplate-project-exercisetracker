const { db } = require("./db");

const postUser = (req, res) => {
    try {
      const { username } = req.body;
    
      // Empty username field
      if (!username) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Username is required",
        });
      }
  
      // Check if user already exists
      db.get("SELECT * FROM Users WHERE username = ?", [username], (err, row) => {
        if (err) {
          return res.status(400).json({
            status: 500,
            success: false,
            error: "Error",
          });
        }
        
        // Already exists in table
        if (row) {
          return res.status(400).json({
            status: 400,
            success: false,
            error: "User with provided username already exists.",
          });
        }
        
        // Insert user
        db.run(
          "INSERT INTO Users(username) VALUES (?)", [username],
          function (err) {
            if (err) {
              return res.status(500).json({
                status: 500,
                success: false,
                error: "Internal Server Error",
              });
            }
            
            // return ID
            db.get(
              "SELECT * FROM Users WHERE id = ?",
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
                  data: row,
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
        error: "Bad request",
      });
    }
};

const getUsers = (req, res) => {
    db.all("SELECT * FROM Users", [], (err, rows) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          success: false,
          error: "Internal Server Error",
        });
      }
      
      // No users
      if (rows.length === 0) {
        return res.status(404).json({
          status: 404,
          success: false,
          error: "No users in table",
        });
      }
  
      return res.status(200).json({
        status: 200,
        success: true,
        data: rows,
      });
    });
}

module.exports = {
    postUser,
    getUsers
};