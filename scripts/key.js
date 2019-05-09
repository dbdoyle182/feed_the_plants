require("dotenv").config();

const keys = {
    openWeatherMapApiKey: process.env.OPEN_WEATHER_MAP_API_KEY,
    agroApi: process.env.AGRO_API
}

module.exports = keys;