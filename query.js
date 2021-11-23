// Import the Google Cloud client library using default credentials
const {
  BigQuery
} = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

module.exports = {
  //BigQuery data
  query: async function(q) {

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const options = {
      query: q,
      // Location must match that of the dataset(s) referenced in the query.
      location: "US",
    };

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    return rows;
  },

  cases_by_state: async function(state_code) {
    //Query used to gather COVID related data
    const state_query = "SELECT date, confirmed_cases FROM bigquery-public-data.covid19_govt_response.oxford_policy_tracker\n" +
      "WHERE region_code = '" + state_code + "' AND confirmed_cases IS NOT NULL\n" +
      "ORDER BY date ASC\n" +
      "LIMIT 1000;"

    //Getting data by connecting with GCP for state data
    let data = await module.exports.query(state_query);

    //Configuring data into an object that can be graphed using chart.js
    let dates = [];
    let cases = [];
    data.forEach((row) => {
      dates.push(row.date.value);
      cases.push(row.confirmed_cases);
    });
    const line_data = {
      labels: dates,
      datasets: [{
        label: state_code + ' Covid Cases',
        data: cases,
      }]
    };

    //returning object needed to render the line graph
    return {
      data: line_data,
      type: 'line'
    };
  },

  //Default data to ensure everything is working
  defaultQuery: function() {
    return {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [{
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      }, ],
    };
  },
};
