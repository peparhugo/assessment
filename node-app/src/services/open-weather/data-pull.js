const axios = require('axios');
const config = require('./config.json');

const apiKey = config.apiKey
const antarcticaCoords = { lat: -82.8628, lon: 135.0000 };


const fetchWeatherData = async () => {
  // TODO: fetch current weather data from OpenWeatherMap API using antarcticaCoords and apiKey via axios
}

exports.weatherData = async () => {
  // TODO: fetch weather data, restructure to the expected output and return it as a JSON object
}