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
  let state_graph = bigQuery.cases_by_state("US_NC");
  state_graph.then((graph_value) => res.render("index", graph_value));
});

/** Listen for requests @ port */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
