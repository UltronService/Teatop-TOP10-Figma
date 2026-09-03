const fs = require('fs');
const path = require('path');

const fileData = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/figma_file_full.json'), 'utf8'));

const imageMap = {};
function walk(node) {
  if (node.fills) {
    node.fills.forEach(f => {
      if (f.imageRef) {
        if (!imageMap[f.imageRef]) imageMap[f.imageRef] = [];
        imageMap[f.imageRef].push({
          id: node.id,
          name: node.name,
          type: node.type,
          box: node.absoluteBoundingBox
        });
      }
    });
  }
  if (node.children) node.children.forEach(walk);
}
walk(fileData.document);

console.log('--- IMAGE REFS MAPPING ---');
for (const [ref, nodes] of Object.entries(imageMap)) {
  console.log(ref, ':', nodes.map(n => n.name + ' (' + n.id + ')').join(', '));
}
