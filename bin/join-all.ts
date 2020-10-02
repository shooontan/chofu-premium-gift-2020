/**
 * npx ts-node --project bin/tsconfig.bin.json bin/join-all.ts
 */
import fs from 'fs';
import path from 'path';
import glob from 'glob';

const stores: unknown[] = [];

const storePaths = glob.sync(
  path.resolve(__dirname, '..', 'static', 'stores', '*.json')
);

storePaths.forEach((storePath) => {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  stores.push(store);
});

fs.writeFileSync(
  path.resolve(__dirname, '..', 'static', 'all.json'),
  JSON.stringify(stores, null, '  ')
);

console.log(`all.json: ${storePaths.length} 店舗`);
