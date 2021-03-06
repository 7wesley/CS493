/**
* This file uses Express to run the server side backend of our project.
* @authors: William Tanaka, Miles Stanley, Noah Lowry, and Wesley Miller
* @version: 12/5/21
*/

//required variables
const express = require("express");
const path = require("path");
const bigQuery = require("./query");
const app = express();
const port = process.env.PORT || "5000";
//Views
app.set("views", "./views");
app.set("view engine", "ejs");

//Parses body of html files for data
app.use(express.urlencoded({
  extended: true
}));

//Makes css directory detectable
app.use(express.static(path.join(__dirname, 'public')));

//GET
app.get("/", (req, res) => {
  res.render("home");
});

//POST request after submission
app.post("/graph_visualization", (req, res) => {
  let state_code = req.body.state_select;
  let graph_choice = req.body.graph_type;
  let policy_req = req.body.policy;
  if (graph_choice === 'percentage_results') {
    let percentage_graph = bigQuery.percentage_comparison(state_code)
    percentage_graph.then((graph_data) => res.render("index", {graph_data: graph_data}));
  }
  else if (graph_choice === 'cumulative_results'){
    let vaccine_graph = bigQuery.vaccination_hospitalization(state_code)
    vaccine_graph.then((graph_data) => res.render("index", {graph_data: graph_data}));
  }
  else {
    let state_graph = bigQuery.cases_by_state(state_code, policy_req);
    state_graph.then((graph_data) => res.render("index", {graph_data: graph_data}));
  }
})

/** Listen for requests @ port */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
