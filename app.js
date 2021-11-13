const express = require("express");
const path = require("path");
const bigQuery = require("./query");
const app = express();
const port = process.env.PORT || "5000";
//Views
app.set("views", "./views");
app.set("view engine", "ejs");

//GET
app.get("/", (req, res) => {
  //Getting data from BigQuery before rendering page
  let data = bigQuery.defaultQuery();
  //Passing data to template
  res.render("index", { data: data });
});

/** Listen for requests @ port */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
