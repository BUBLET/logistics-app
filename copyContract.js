const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'build/contracts/Logistics.json');
const destination = path.join(__dirname, 'frontend/LogisticsApp/src/contracts/Logistics.json');

fs.copyFile(source, destination, (err) => {
  if (err) {
    console.error('Error copying contract JSON:', err);
  } else {
    console.log('Contract JSON copied to frontend src folder');
  }
});
