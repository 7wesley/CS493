# Setting up Google Cloud Platform Credentials
## (For more information visit https://cloud.google.com/bigquery/docs/reference/libraries)

## For Linux Systems
```sh
export GOOGLE_APPLICATION_CREDENTIALS="<KEY_PATH>"
```

## For Windows Systems
```sh
set GOOGLE_APPLICATION_CREDENTIALS="<KEY_PATH>"
```
------------
# Running the Application

## Run app
```sh
node app.js
```

## Run app as dev
```sh
npm run dev
```

## Build and run container
```bash
docker build -t cs493 .
docker run --name cs493-container -p 5000:5000 cs493
```
