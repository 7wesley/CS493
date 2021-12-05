/**
* This file holds the asynchronous query functions called by our front end.
* @authors: William Tanaka and Miles Stanley
* @version: 12/5/21
*/

// BigQueryAPI
const {
  BigQuery
} = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

module.exports = {
  /**
  * This function runs queries by contatcting BigQuery through the GCP client
  * library.
  * @param String q: a query to be rung through bigQuery
  * @return *[] rows: an array of the returnedd values of the query
  */
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

  /**
  * This function runs a query that displays COVID cases by state and highlights dates that a policy is active.
  * @param String state_code: a code that represents which state's data will be queried for.
  * @param String policy_req: a string that represents which ploicy to query on.
  * @return Object[] line_data: an object used by ChartJS to visualize our data.
  */
  cases_by_state: async function(state_code, policy_req) {
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

    let mandate_dates = await module.exports.home_mandate_dates(state_code, policy_req);
    // console.log("These are the mandate dates: " + mandate_dates);

    let coloredData = [];
    for(i = 0; i < dates.length; i++){
      if (mandate_dates.includes(dates[i])) {
        coloredData.push("rgba(54, 162, 235, 1)");
      }
      else {
        coloredData.push("rgba(255, 99, 132, 1)")
      }
    }

    const line_data = {
      labels: dates,
      datasets: [{
        label: state_code + ' Covid Cases',
        data: cases,
        backgroundColor: coloredData
      }]
    };

    return line_data;
  },

  /**
  * This function gets an array of dates in which stay at home mandate is active
  * @param String state_code: a code that represents which state's data will be queried for.
  * @param String policy_req: a string that represents which ploicy to query on.
  * @return String[] dates: an array of dates when the policy was active in the state.
  */
  home_mandate_dates: async function(state_code, policy_req) {
    //Query used to gather COVID related data
    const state_query = "SELECT date FROM bigquery-public-data.covid19_govt_response.oxford_policy_tracker\n" +
      "WHERE region_code = '" + state_code + "' AND " + policy_req + "\n" +
      "ORDER BY date ASC\nLIMIT 1000;"

    //Getting data by connecting with GCP for state data
    let data = await module.exports.query(state_query);

    //Configuring data into an object that can be graphed using chart.js
    let dates = [];
    data.forEach((row) => {
      dates.push(row.date.value);
    });

    return dates;
  },

  /**
  * This function runs a query that displays cumulative persons vaccinated and new hospitalized patients by state
  * @param String state_code: a code that represents which state's data will be queried for.
  * @return Object[] line_data: an object used by ChartJS to visualize our data.
  */
  vaccination_hospitalization: async function(state_code) {
    const hospitalized_query = "SELECT date, new_hospitalized_patients\n" +
      "FROM bigquery-public-data.covid19_open_data.covid19_open_data\nWHERE location_key = '" + state_code + "'\n" +
      "ORDER BY date ASC\nLIMIT 1000;";
    //Getting data by connecting with GCP for state data
    let data = await module.exports.query(hospitalized_query);

    //Configuring data into an object that can be graphed using chart.js
    let dates = [];
    let hospital_records = [];
    data.forEach((row) => {
      dates.push(row.date.value);
      hospital_records.push(row.new_hospitalized_patients);
    });

    const vaccine_query = "SELECT cumulative_persons_fully_vaccinated\n" +
      "FROM bigquery-public-data.covid19_open_data.covid19_open_data\nWHERE location_key = '" + state_code + "'\n" +
      "ORDER BY date ASC\nLIMIT 1000;";

    let data2 = await module.exports.query(vaccine_query);

    let vaccine_records = [];
    data2.forEach((row) => {
      vaccine_records.push(row.cumulative_persons_fully_vaccinated / 10000);
    });

    //setting up ChartJS object
    const line_data = {
      labels: dates,
      datasets: [{
        label: 'Hospitilized Patients',
        data: hospital_records,
        backgroundColor: 'Red',
      },
      {
        label: 'Vaccinated Persons by 10000s',
        data: vaccine_records,
        backgroundColor: 'Blue',
      }]

    };

    return line_data;
  },

  /**
  * This function runs a query that displays cumulative hospitalized patients and
  * cumulative persons vaccinate by the 10,000's by state.
  * @param String state_code: a code that represents which state's data will be queried for.
  * @return Object[] line_data: an object used by ChartJS to visualize our data.
  */
  percentage_comparison: async function(state_code) {
    const hospitalized_query = "SELECT date, cumulative_confirmed, cumulative_hospitalized_patients\n" +
      "FROM bigquery-public-data.covid19_open_data.covid19_open_data\nWHERE location_key = '" + state_code + "'\n" +
      "ORDER BY date ASC\nLIMIT 1000;";
    //Getting data by connecting with GCP for state data
    let data = await module.exports.query(hospitalized_query);

    //Configuring data into an object that can be graphed using chart.js
    let dates = [];
    let hospitalized_percentage = [];
    data.forEach((row) => {
      dates.push(row.date.value);
      hospitalized_percentage.push((row.cumulative_hospitalized_patients / row.cumulative_confirmed));
    });

    //second query
    const vaccine_query = "SELECT population, cumulative_persons_fully_vaccinated\n" +
      "FROM bigquery-public-data.covid19_open_data.covid19_open_data\nWHERE location_key = '" + state_code + "'\n" +
      "ORDER BY date ASC\nLIMIT 1000;";

    let data2 = await module.exports.query(vaccine_query);

    let percentage_vaccinated = [];
    data2.forEach((row) => {
      percentage_vaccinated.push(row.cumulative_persons_fully_vaccinated / row.population);
    });

    //setting up ChartJS object
    const line_data = {
      labels: dates,
      datasets: [{
        label: 'Percentage of Cases that result in Hospitalization',
        data: hospitalized_percentage,
        backgroundColor: 'Red',
      },
      {
        label: 'Percentage of Population Vaccinated',
        data: percentage_vaccinated,
        backgroundColor: 'Blue',
      }]

    };

    return line_data;
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
