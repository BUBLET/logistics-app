const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'build', 'contracts', 'Logistics.json');
const destPath = path.join(__dirname, 'frontend', 'LogisticsApp', 'src', 'contracts', 'Logistics.json');

fs.copyFile(sourcePath, destPath, (err) => {
  if (err) {
    console.error('Error while copying contract`s .json:', err);
    process.exit(1);
  }
  console.log('Logistics.json succesfully copy to src');
});
