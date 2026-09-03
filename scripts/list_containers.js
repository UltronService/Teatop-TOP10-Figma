const fs = require('fs');
const path = require('path');

const fileData = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/figma_file_full.json'), 'utf8'));

console.log('Document name:', fileData.name);
const allNodes = [];
function walk(n, pathStr = '') {
  const curPath = pathStr ? `${pathStr} > ${n.name}` : n.name;
  if (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'SECTION' || n.type === 'CANVAS') {
    allNodes.push({ id: n.id, name: n.name, type: n.type, path: curPath, box: n.absoluteBoundingBox });
  }
  if (n.children) n.children.forEach(c => walk(c, curPath));
}
walk(fileData.document);

console.log('Major containers:');
allNodes.forEach(n => {
  console.log(`- [${n.id}] (${n.type}) ${n.name} | ${JSON.stringify(n.box)}`);
});
