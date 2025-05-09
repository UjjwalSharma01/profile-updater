console.log('Simple test for Linux implementation');
console.log('Testing filesystem access');

const fs = require('fs');
const path = require('path');

console.log('Current directory:', __dirname);

try {
  const files = fs.readdirSync(__dirname);
  console.log('Files in current directory:', files);
} catch (err) {
  console.error('Error reading directory:', err);
}

console.log('Test complete');
