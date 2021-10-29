var express = require("express");
var app = express();
var port = 8080;
var chartData = require("./chartData");
var alerts = require("./alertData");
var mockData = chartData.mockData,
  formattedData = chartData.formattedData;
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
var getRandomChartData = function () {
  var randomChartDataIndex = Math.floor(Math.random() * mockData.length);
  return mockData[randomChartDataIndex];
};
app.get("/api/getChartData/1", function (req, res) {
  res.send(formattedData);
});
app.get("/api/getChartData/2", function (req, res) {
  res.send(getRandomChartData());
});
app.get("/api/getChartData/3", function (req, res) {
  var randomifier = Math.random();
  //fail one in 5 times
  if (randomifier > 0.2) {
    res.status(500).send("CRITICAL FAILURE");
  }
  res.send(getRandomChartData());
});
app.get("/api/getAlertData", function (req, res) {
  res.send(alerts);
});
app.listen(port, function () {
  console.log("server started at http://localhost:" + port);
});
