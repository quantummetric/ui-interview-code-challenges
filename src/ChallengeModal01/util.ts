import { QueryResult } from "./../charts/utilities/types";
import { LineData } from "../charts/utilities/types";

/* Query Result Data structure

dimensions: [timestamp],
measure: [
  app_cache
  dns
  tcp
  request
  response
  processing
  load
]

*/

/* Chart Data Structure

    id: 'app_cache',
    text: 'app_cache',
    values: [
      [timestamp, value],
      [timestamp, value],
      [timestamp, value],
      [timestamp, value],
      ...,
    ]

*/

// ANSWERS

const metricColumnNames = [
  "app_cache",
  "dns",
  "tcp",
  "request",
  "response",
  "processing",
  "load",
];

const someLongUrls = [
  "anextremelylongurl.com?someSortOfQueryParam=definitely",
  "reallycoolwebsite.com/catalog/product/1234?isLong=true",
  "shorturlname.com",
  "quantumcookies.com/checkout/payment",
  "prettycoolwebsite.com/1/2/3",
  "startingtorunoutofideasforlongwebsitenames.com/folder/path/thing",
  "thiswillwithoutadoubtbethelongesturlthatwillbeinthischallenge.com/a/b/c/d/e?param1=cool&param2=something-else&param3=some-final-thing",
];

// CHALLENGE SECTION

const shapeChartData = (unformattedData: QueryResult[]): LineData[] => {
  return [];
};

export { shapeChartData };
