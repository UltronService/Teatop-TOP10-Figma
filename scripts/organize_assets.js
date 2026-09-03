const fs = require('fs');
const path = require('path');

const fileData = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/figma_file_full.json'), 'utf8'));
const doc = fileData.document;

// Ensure output dirs
const outImgDir = path.join(__dirname, '../assets/images');
const drinksDir = path.join(outImgDir, 'drinks');
const badgesDir = path.join(outImgDir, 'badges');
[outImgDir, drinksDir, badgesDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Let's copy logo
const logoSrc = path.join(__dirname, '../assets/node_3_122.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(outImgDir, 'logo.png'));
  console.log('Copied logo.png');
}

// Let's copy badges
// Hot badge (node_3_8.png / node_3_21.png)
if (fs.existsSync(path.join(__dirname, '../assets/node_3_8.png'))) {
  fs.copyFileSync(path.join(__dirname, '../assets/node_3_8.png'), path.join(badgesDir, 'badge_hot.png'));
}
// Multi badge 1 (node_3_45.png - 🚫 ♨️ 固)
if (fs.existsSync(path.join(__dirname, '../assets/node_3_45.png'))) {
  fs.copyFileSync(path.join(__dirname, '../assets/node_3_45.png'), path.join(badgesDir, 'badge_no_caffeine_hot_fixed.png'));
}
// Fixed sweetness badge (node_3_69.png - 固)
if (fs.existsSync(path.join(__dirname, '../assets/node_3_69.png'))) {
  fs.copyFileSync(path.join(__dirname, '../assets/node_3_69.png'), path.join(badgesDir, 'badge_fixed_sugar.png'));
}

// Let's copy hero drink renders
// Drink 1: node_3_127.png
// Drink 2: node_3_132.png
// Drink 3: node_3_137.png
// Drink 4: node_3_142.png
// Drink 5: node_3_147.png
const heroMap = {
  1: 'node_3_127.png',
  2: 'node_3_132.png',
  3: 'node_3_137.png',
  4: 'node_3_142.png',
  5: 'node_3_147.png'
};

for (const [rank, filename] of Object.entries(heroMap)) {
  const src = path.join(__dirname, '../assets', filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(drinksDir, `drink_${rank}.png`));
    console.log(`Copied drink_${rank}.png`);
  }
}

// Let's also check other fill images that could be drinks 6-10 or additional assets
// Let's inspect large fill images (>20KB)
const fills = fs.readdirSync(path.join(__dirname, '../assets')).filter(f => f.startsWith('fill_'));
fills.forEach(f => {
  const stat = fs.statSync(path.join(__dirname, '../assets', f));
  if (stat.size > 20000) {
    console.log('Large fill:', f, (stat.size / 1024).toFixed(1) + ' KB');
  }
});
