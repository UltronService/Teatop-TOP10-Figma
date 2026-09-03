const fs = require('fs');
const path = require('path');

const fileData = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/figma_file_full.json'), 'utf8'));

// Find frame 3:2
let frame32 = null;
function findNode(n) {
  if (n.id === '3:2') frame32 = n;
  if (n.children) n.children.forEach(findNode);
}
findNode(fileData.document);

console.log('Frame 3:2 name:', frame32.name, 'size:', frame32.absoluteBoundingBox);

const drinkItems = [];
frame32.children.forEach(child => {
  // Check if it's one of the 10 ranking cards
  const textChildren = [];
  function getTexts(n) {
    if (n.type === 'TEXT') {
      textChildren.push({
        id: n.id,
        name: n.name,
        characters: n.characters,
        style: n.style,
        fills: n.fills,
        box: n.absoluteBoundingBox
      });
    }
    if (n.children) n.children.forEach(getTexts);
  }
  getTexts(child);

  if (textChildren.length > 0) {
    drinkItems.push({
      cardId: child.id,
      cardName: child.name,
      cardBox: child.absoluteBoundingBox,
      cardFills: child.fills,
      texts: textChildren
    });
  }
});

console.log('Found drink cards count:', drinkItems.length);
fs.writeFileSync(path.join(__dirname, '../assets/drink_items_parsed.json'), JSON.stringify(drinkItems, null, 2));

drinkItems.forEach((d, i) => {
  console.log(`\n--- Card ${i + 1} (${d.cardId}) ---`);
  d.texts.forEach(t => {
    console.log(`  [${t.name}] "${t.characters}" (fontSize: ${t.style?.fontSize}, fontWeight: ${t.style?.fontWeight}, fill: ${JSON.stringify(t.fills?.[0]?.color)})`);
  });
});
