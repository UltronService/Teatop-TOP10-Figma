const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join(__dirname, '../assets')).filter(f => f.startsWith('fill_'));
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #1a1a1a; color: #fff; display: flex; flex-wrap: wrap; gap: 16px; font-family: sans-serif; padding: 20px; }
.card { background: #2a2a2a; padding: 12px; border-radius: 8px; text-align: center; width: 220px; }
img { max-width: 180px; max-height: 180px; object-fit: contain; background: #3a3a3a; border-radius: 4px; }
p { font-size: 11px; word-break: break-all; margin: 8px 0 0; }
</style>
</head>
<body>
${files.map(f => `<div class="card"><img src="${f}"><p>${f}</p></div>`).join('\n')}
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../assets/preview_fills.html'), html);
console.log('Created assets/preview_fills.html with ' + files.length + ' images');
