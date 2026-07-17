/* ============================================================
   Weather Service — OpenWeatherMap API integration
   ============================================================ */
const axios = require('axios');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather for given coordinates.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} Normalized weather data
 */
const getCurrentWeather = async (lat, lng) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_openweather_api_key') {
    // Return mock data if API key is not configured
    return getMockWeather();
  }

  try {
    const response = await axios.get(`${OWM_BASE}/weather`, {
      params: {
        lat,
        lon: lng,
        appid: apiKey,
        units: 'metric',
        lang: 'en',
      },
      timeout: 5000,
    });

    const data = response.data;
    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      condition: data.weather[0].main,
      visibility: Math.round((data.visibility || 10000) / 1000), // m to km
      uvIndex: null, // requires OneCall API
    };
  } catch (error) {
    console.warn('⚠️ Weather API error, returning mock data:', error.message);
    return getMockWeather();
  }
};

/**
 * Mock weather data when API key is not configured.
 */
const getMockWeather = () => ({
  city: 'Your Location',
  temperature: 32,
  feelsLike: 36,
  humidity: 65,
  windSpeed: 12,
  description: 'partly cloudy',
  icon: 'https://openweathermap.org/img/wn/02d@2x.png',
  condition: 'Clouds',
  visibility: 10,
  uvIndex: null,
  isMock: true,
});

module.exports = { getCurrentWeather };
