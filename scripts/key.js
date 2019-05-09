require("dotenv").config();

const test = {
    openWeatherMapApiKey: process.env.OPEN_WEATHER_MAP_API_KEY,
    agroApi: process.env.AGRO_API,
    dataGov: process.env.DATA_GOV_API_KEY
}

const aws = {
    ecoSystemClient: process.env.ECO_SYSTEM_CLIENT_ID,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

module.exports = {test, aws};
