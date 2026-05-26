import fs from 'fs';
import { execSync } from 'child_process';

const CHUNKS_COUNT = 24;
const CHUNKS_DIR = './chunks';

function checkChunks() {
  let missingFiles = [];
  for (let i = 0; i < CHUNKS_COUNT; i++) {
    const file = `${CHUNKS_DIR}/corrections_${i}.json`;
    if (!fs.existsSync(file)) {
      missingFiles.push(i);
    }
  }
  return missingFiles;
}

let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  const missing = checkChunks();
  if (missing.length === 0) {
    console.log('All chunks ready. Running apply_fixes.js...');
    clearInterval(interval);
    try {
      let output = execSync('node apply_fixes.js', { encoding: 'utf8' });
      console.log(output);
    } catch (e) {
      console.error(e.stdout || e.message);
    }
  } else {
    console.log(`Waiting for ${missing.length} chunks... (${missing.join(', ')})`);
    if (attempts > 30) {
      console.log('Timeout after 5 minutes.');
      clearInterval(interval);
    }
  }
}, 10000);
