# Assessment

## Introduction

This is a simple assessment to test you ability to pull data from a third-party API and restructure the data,
so it can be loaded it into a database. You will be using the [OpenWeatherMap API](https://openweathermap.org/api) to
pull weather
data for a list of cities and load it into a database.

## Directory Structure

```
coding-challenge/
│
├── node-app/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
│       └── services/
│           └── open-weather
│               └── data-pull.js
│               └── config.json*
│
└── docker-compose.yml

```

### config.json

This file is ignored in the project. It is to prevent api keys from getting committed to the git history.
You will need to create this file in the `node-app/src/services/open-weather` directory.

```json
{
  "apiKey": "your key here"
}
```

### data-pull.js

This file is where you will write the code to pull data from the OpenWeatherMap API and load it into the database.

The function `weatherData` is imported and called in `node-app/src/index.js`.

## Instructions

### Step 1

Install docker desktop for your operating system. [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 2

Create a free account on [OpenWeatherMap](https://openweathermap.org/api) and get an API key.

### Step 3

Create the `config.json` file in the `node-app/src/services/open-weather` directory and add your API key to it.

```json
{
  "apiKey": "your key here"
}
```

### Step 4

Update data-pull.js to pull data from the OpenWeatherMap API https://openweathermap.org/current.

The expected output of the `weatherData` function is:

```json
{
  "dataPoints": {
    "temp": 237.12,
    "feels_like": 230.12,
    "temp_min": 237.12,
    "temp_max": 237.12,
    "pressure": 1009,
    "humidity": 83,
    "sea_level": 1009,
    "grnd_level": 701,
    "visibility": 10000,
    "wind": {
      "speed": 3.91,
      "deg": 180,
      "gust": 3.74
    },
    "clouds": {
      "all": 86
    }
  },
  "coord": {
    "lon": 135,
    "lat": -82.8628
  },
  "weather": [
    {
      "id": 804,
      "main": "Clouds",
      "description": "overcast clouds",
      "icon": "04n"
    }
  ],
  "base": "stations",
  "dt": 1700157480,
  "sys": {
    "sunrise": 0,
    "sunset": 0
  },
  "timezone": 28800,
  "id": 0,
  "name": "",
  "cod": 200
}
```

Your solution should consider all possible fields the JSON format could return in this response.
You can see the field list here: https://openweathermap.org/current#fields_json

Note: Elasticsearch will expect the data to be in the above format but by default it is a dynamic mapping so you can add
any fields you want.
Part of the challenge is making sure the data is in the correct format without any additional fields.

### Step 5

From the root project directory run `docker-compose up --build` to start the application.

If you need to restart docker compose run `docker-compose down && docker-compose up --build`.

Pulling the weather data is scheduled to run every 1 minute after launch.

The initial node-app launch may raise an error as elasticsearch and kibana launch.

Note: Everytime you relaunch the application the elasticsearch data will be cleared. This is expected.

### Step 6

If you want to see the data in elasticsearch you can use kibana.

Open a browser and go to http://localhost:5601/app/dev_tools#/console

In the dev tools console run the following command to see the data in elasticsearch. It will pull up to 5 records.

```
GET weatherdata/_search
{
  "query": {
    "match_all": {}
  }
}
```

Example Output

```json
{
  "took": 10,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "weatherdata",
        "_type": "_doc",
        "_id": "x9tL2YsByEil_wwlHZCQ",
        "_score": 1.0,
        "_source": {
          "dataPoints": {
            "temp": 237.12,
            "feels_like": 230.12,
            "temp_min": 237.12,
            "temp_max": 237.12,
            "pressure": 1009,
            "humidity": 83,
            "sea_level": 1009,
            "grnd_level": 701,
            "visibility": 10000,
            "wind": {
              "speed": 3.91,
              "deg": 180,
              "gust": 3.74
            },
            "clouds": {
              "all": 86
            }
          },
          "coord": {
            "lon": 135,
            "lat": -82.8628
          },
          "weather": [
            {
              "id": 804,
              "main": "Clouds",
              "description": "overcast clouds",
              "icon": "04n"
            }
          ],
          "base": "stations",
          "dt": 1700157480,
          "sys": {
            "sunrise": 0,
            "sunset": 0
          },
          "timezone": 28800,
          "id": 0,
          "name": "",
          "cod": 200
        }
      }
    ]
  }
}
```

## Appendix

Elasticsearch `weatherdata` mappings

```
{
settings: {
  number_of_shards: 1,
  number_of_replicas: 0
},
mappings: {
  properties: {
    coord: { type: 'geo_point' },
    weather: {
      type: 'nested',
      properties: {
        id: { type: 'integer' },
        main: { type: 'keyword' },
        description: { type: 'keyword' },
        icon: { type: 'keyword' }
      }
    },
    base: { type: 'keyword' },
    dataPoints: {
      'properties': {
        'temp': { 'type': 'float' },
        'feels_like': { 'type': 'float' },
        'temp_min': { 'type': 'float' },
        'temp_max': { 'type': 'float' },
        'pressure': { 'type': 'integer' },
        'humidity': { 'type': 'integer' },
        'sea_level': { 'type': 'integer' },
        'grnd_level': { 'type': 'integer' },
        'wind': {
          'properties': {
            'speed': { 'type': 'float' },
            'deg': { 'type': 'integer' },
            'gust': { 'type': 'float' }
          }
        },
        'visibility': { 'type': 'integer' },
        'clouds': {
          'properties': {
            'all': { 'type': 'integer' }
          }
        },
        'rain': {
          'properties': {
            '1h': { 'type': 'float' },
            '3h': { 'type': 'float' }
          }
        },
        'snow': {
          'properties': {
            '1h': { 'type': 'float' },
            '3h': { 'type': 'float' }
          }
        }
      }
    },
    dt: { type: 'date' },
    sys: { type: 'object' },
    timezone: { type: 'integer' },
    id: { type: 'integer' },
    name: { type: 'keyword' },
    cod: { type: 'integer' }
  }
}
```