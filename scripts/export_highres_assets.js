const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.FIGMA_TOKEN || ''; // Ensure you set FIGMA_TOKEN environment variable
const fileKey = 'f1VKrhz4QUXoE3H3sw9jX3';

async function fetchFigma(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://api.figma.com/v1/${endpoint}`, {
      headers: { 'X-Figma-Token': token }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function exportAll() {
  const assetsDir = path.join(__dirname, '../assets/images');
  const drinksDir = path.join(assetsDir, 'drinks');
  const badgesDir = path.join(assetsDir, 'badges');

  [assetsDir, drinksDir, badgesDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const exportMap = {
    'logo.png': '3:122',
    // Drinks
    'drinks/drink_1_cup.png': '3:126',
    'drinks/drink_1_hero.png': '3:127',
    'drinks/drink_1_full.png': '3:128',
    'drinks/drink_2_cup.png': '3:131',
    'drinks/drink_2_hero.png': '3:132',
    'drinks/drink_2_full.png': '3:133',
    'drinks/drink_3_cup.png': '3:136',
    'drinks/drink_3_hero.png': '3:137',
    'drinks/drink_3_full.png': '3:138',
    'drinks/drink_4_cup.png': '3:141',
    'drinks/drink_4_hero.png': '3:142',
    'drinks/drink_4_full.png': '3:143',
    'drinks/drink_5_cup.png': '3:146',
    'drinks/drink_5_hero.png': '3:147',
    'drinks/drink_5_full.png': '3:148',
    // Badges / Icons
    'badges/badge_hot.png': '3:8',
    'badges/badge_no_caffeine_hot_fixed.png': '3:45',
    'badges/badge_fixed_sugar.png': '3:69',
    'badges/badge_hot_navy.png': '3:81'
  };

  const ids = Object.values(exportMap).join(',');
  console.log('Requesting renders for:', ids);
  const res = await fetchFigma(`images/${fileKey}?ids=${ids}&format=png&scale=2`);
  
  if (res.images) {
    for (const [name, id] of Object.entries(exportMap)) {
      const url = res.images[id];
      if (url) {
        const dest = path.join(assetsDir, name);
        console.log(`Downloading ${name} from ${id}...`);
        await downloadFile(url, dest);
      }
    }
  }
  console.log('All image exports completed!');
}

exportAll().catch(console.error);
