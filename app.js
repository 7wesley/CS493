const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || "5000";

/** Routes */

//GET
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

/** Listen for requests @ port */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
