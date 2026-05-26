import fs from 'fs';
import { questions } from './src/data.js';

let chunkSize = 100;
for (let i = 0; i < questions.length; i += chunkSize) {
  let chunk = questions.slice(i, i + chunkSize);
  fs.writeFileSync(`./chunk_${Math.floor(i/chunkSize)}.json`, JSON.stringify(chunk, null, 2));
}
console.log(`Created ${Math.ceil(questions.length / chunkSize)} chunks.`);
