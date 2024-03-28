const { postUser, getUsers } = require("./users.js");
const { postExercise, getLogs } = require("./exercises.js");

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", (req, res) => {
  postUser(req, res);
});

app.get("/api/users", (req, res) => {
  getUsers(req, res);
});

app.post("/api/users/:id/exercises", (req, res) => {
  postExercise(req, res);
});

app.get("/api/users/:id/logs", (req, res) => {
  getLogs(req, res);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
