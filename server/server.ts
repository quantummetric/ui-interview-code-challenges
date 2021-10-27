const express = require('express');
const app = express();
const port = 8080;
const chartData = require('./chartData');
const alerts = require('./alertData');
const { mockData, formattedData } = chartData;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const getRandomChartData = () => {
  const randomChartDataIndex = Math.floor(Math.random() * mockData.length);
  return mockData[randomChartDataIndex];
};

app.get('/api/getChartData/1', (req, res) => {
  res.send(formattedData);
});

app.get('/api/getChartData/2', (req, res) => {
  res.send(getRandomChartData());
});

app.get('/api/getChartData/3', (req, res) => {
  const randomifier = Math.random();
  //fail one in 5 times
  if (randomifier > 0.2) {
    res.status(500).send('CRITICAL FAILURE');
  }
  res.send(getRandomChartData());
});

app.get('/api/getAlertData', (req, res) => {
  res.send(alerts);
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
