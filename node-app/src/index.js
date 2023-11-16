const elasticsearch = require('elasticsearch');
const schedule = require('node-schedule');
const weatherData = require('./services/open-weather/data-pull.js');

const client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'trace'
});

// OpenWeatherMap API details
const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
const antarcticaCoords = { lat: -82.8628, lon: 135.0000 }; // Coordinates for a location in Antarctica
const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${antarcticaCoords.lat}&lon=${antarcticaCoords.lon}&appid=${apiKey}`;

const fetchAndIndexWeatherData = async () => {
  try {
    const data = await weatherData.weatherData();

    client.index({
      index: 'weatherdata',
      body: data
    }, function(err, resp, status) {
      if (err) {
        console.error('Error indexing data:', err);
      } else {
        console.log('Data indexed successfully:', resp);
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Create index if it doesn't exist
client.indices.exists({ index: 'weatherdata' }, (err, resp, status) => {
  if (status === 404) {
    client.indices.create({
      index: 'weatherdata',
      body: {
        // Index settings and mappings
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
      }
    }, (error, response, status) => {
      if (error) {
        console.error('Error creating index:', error);
      } else {
        console.log('Index created successfully:', response);
      }
    });
  }
});

// Schedule to run every 1 minutes
schedule.scheduleJob('*/1 * * * *', () => {
  console.log('Fetching weather data...');
  fetchAndIndexWeatherData().then(() => {});
});


