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
  let state_graph = bigQuery.cases_by_state('US_NC');
  state_graph.then((graph_data) => res.render("index", {graph_data: graph_data}));
});

app.get("/record2", (req, res) => {
  let vaccine_graph = bigQuery.vaccination_hospitalization('US_NC')
  vaccine_graph.then((graph_data) => res.render("index", {graph_data: graph_data}));
});

app.get("/record3", (req, res) => {
  let percentage_graph = bigQuery.percentage_comparison('US_NC')
  percentage_graph.then((graph_data) => res.render("index", {graph_data: graph_data}));
});

/** Listen for requests @ port */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
