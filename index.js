const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const people = [];

// GET and POST routes
app.get("/", (req, res) => {
  // console.log("In / route!");
  // res.send("Hello world");
  res.json(people);
});

// Insert endpoint
app.post("/insert", (req, res) => {
  people.push("Alex");
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log("Example app listening.");
});