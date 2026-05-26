import fs from 'fs';
import { questions } from './src/data.js';

let chunkSize = 50;
let chunksDir = './chunks';
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir);
}

for (let i = 0; i < questions.length; i += chunkSize) {
  let chunk = questions.slice(i, i + chunkSize);
  fs.writeFileSync(`${chunksDir}/chunk_${Math.floor(i/chunkSize)}.json`, JSON.stringify(chunk, null, 2));
}
console.log(`Created ${Math.ceil(questions.length / chunkSize)} chunks of 50 questions each.`);
