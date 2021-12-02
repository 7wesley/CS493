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

    //Getting array of dates in which stay at home mandate is active
    // let mandate_dates = await module.exports.home_mandate_dates(state_code);
    // console.log("These are the mandate dates: " + mandate_dates);

    const line_data = {
      labels: dates,
      datasets: [{
        label: state_code + ' Covid Cases',
        data: cases,
        backgroundColor: (context) => { //This is not working for some reason
          var index = context.dataIndex;
          var value = context.dataset.data[index];
          console.log('Testing on ' + index);
          // if mandate_dates.includes(index){
          //   return 'red';
          // }
          return 'red';
        }
      }]
    };

    return line_data;
  },

  home_mandate_dates: async function(state_code) {
    //Query used to gather COVID related data
    const state_query = "SELECT date FROM bigquery-public-data.covid19_govt_response.oxford_policy_tracker\n" +
      "WHERE region_code = 'US_NC' AND stay_at_home_requirements = '2.00' AND stay_at_home_requirements_flag = '1'\n" +
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

  vaccination_hospitalization: async function() {
    const hospitalized_query = "SELECT date, cumulative_hospitalized_patients\n" +
      "FROM bigquery-public-data.covid19_open_data.covid19_open_data\nWHERE location_key = 'US'\n" +
      "ORDER BY date ASC\nLIMIT 1000;";
    //Getting data by connecting with GCP for state data
    let data = await module.exports.query(hospitalized_query);

    //Configuring data into an object that can be graphed using chart.js
    let dates = [];
    let hospital_records = [];
    data.forEach((row) => {
      dates.push(row.date.value);
      hospital_records.push(row.cumulative_hospitalized_patients);
    });

    const vaccine_query = "SELECT new_persons_fully_vaccinated\n" +
      "FROM bigquery-public-data.covid19_open_data.covid19_open_data\nWHERE location_key = 'US'\n" +
      "ORDER BY date ASC\nLIMIT 1000;";

    let data2 = await module.exports.query(vaccine_query);

    let vaccine_records = [];
    data2.forEach((row) => {
      vaccine_records.push(row.new_persons_fully_vaccinated);
    });


    const line_data = {
      labels: dates,
      datasets: [{
        label: 'Cumulative Hospitilized Patients',
        data: hospital_records,
        backgroundColor: 'Red',
      },
      {
        label: 'Cumulative Vaccinated Persons',
        data: vaccine_records,
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
