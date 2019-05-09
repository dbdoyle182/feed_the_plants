const express = require("express");
const routes = require("./routes");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const serverless = require("serverless-http");



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger(`dev`));

app.use(cors());

app.use(routes);


module.exports.handler = serverless(app);


