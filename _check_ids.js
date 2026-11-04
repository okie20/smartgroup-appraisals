const fs = require('fs');
function ids(p) {
  const t = fs.readFileSync(p, 'utf8');
  const m = [...t.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((x) => x[1]);
  const c = {};
  m.forEach((id) => {
    c[id] = (c[id] || 0) + 1;
  });
  const d = Object.entries(c).filter(([, n]) => n > 1);
  console.log(p, 'count', m.length, 'unique', Object.keys(c).length);
  console.log('dups', d);
}
ids('src/data/userUploadedDataset.ts');
ids('src/data/defaultRoster.ts');
