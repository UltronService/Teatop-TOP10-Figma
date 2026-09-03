const fs = require('fs');
const path = require('path');

const fills = fs.readdirSync(path.join(__dirname, '../assets')).filter(f => f.startsWith('fill_'));
console.log('Total fills count:', fills.length);

// Let's copy all large fills into a readable naming for inspect
fills.forEach((f, idx) => {
  const stat = fs.statSync(path.join(__dirname, '../assets', f));
  console.log(`Fill #${idx + 1}: ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
