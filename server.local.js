const express = require("express");
const routes = require("./routes");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const app = express();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger(`dev`));

app.use(cors());

app.use(routes);


app.listen(PORT, function() {
  console.log(`Server listening on: http://localhost:` + PORT);
});
