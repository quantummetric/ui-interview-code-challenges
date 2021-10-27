const alerts = [
  {
    id: 1,
    name: 'Session Drop',
    description: 'Sessions have dropped by over 20% from historical',
    inProgress: false,
    value: 20000,
    startTime: 1612457600,
  },
  {
    id: 2,
    name: 'App Crash',
    description: 'Increase in the amount of Yellow Screen of Death app crashes',
    inProgress: false,
    value: 3,
    startTime: 1616451600,
  },
  {
    id: 3,
    name: 'Product API 500',
    description:
      'API 500 responses from the product page, but also this description is much longer and will cause the text to wrap',
    inProgress: true,
    value: 10000,
    startTime: 1616257600,
  },
  {
    id: 4,
    name: 'iOS Native Crash',
    description: 'iOS Sessions natively crashing',
    inProgress: false,
    value: 12,
    startTime: 1616457600,
  },
  {
    id: 5,
    name: '404 Page',
    description: 'Users hitting 404 page',
    inProgress: true,
    value: 3000,
    startTime: 1616457600,
  },
  {
    id: 6,
    name: 'Android Native Crash',
    description: 'Android Sesisons natively crashing',
    inProgress: false,
    value: 17,
    startTime: 1613457600,
  },
  {
    id: 7,
    name: 'Conversion Rate Drop',
    description: 'Conversion rate dropped by more than 1%',
    inProgress: false,
    value: 0.03,
    startTime: 1616257600,
  },
];

module.exports = alerts;
