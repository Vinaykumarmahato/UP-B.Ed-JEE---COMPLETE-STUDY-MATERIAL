import fs from 'fs';

// This script aggregates all corrections and applies them to the main data.js file
// It also shuffles the options randomly to ensure a balanced distribution of A, B, C, D

const CHUNKS_COUNT = 24;
const CHUNKS_DIR = './chunks';
const DATA_FILE = './src/data.js';

async function main() {
  console.log('Checking for correction files...');
  
  let allCorrections = [];
  let missingFiles = [];

  for (let i = 0; i < CHUNKS_COUNT; i++) {
    const file = `${CHUNKS_DIR}/corrections_${i}.json`;
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        // Handle potential empty or malformed files gracefully
        if (content.trim() === '') continue;
        const corrections = JSON.parse(content);
        if (Array.isArray(corrections)) {
          allCorrections = allCorrections.concat(corrections);
        }
      } catch (e) {
        console.error(`Error parsing ${file}:`, e.message);
      }
    } else {
      missingFiles.push(i);
    }
  }

  if (missingFiles.length > 0) {
    console.log(`Still waiting for chunks: ${missingFiles.join(', ')}`);
    return;
  }

  console.log(`All chunks processed. Found ${allCorrections.length} total corrections.`);
  
  // Create a map for quick lookup
  const correctionMap = new Map();
  for (let c of allCorrections) {
    correctionMap.set(c.id, c);
  }

  // Read original data.js
  let dataStr = fs.readFileSync(DATA_FILE, 'utf8');
  // Hack to load questions without full AST parsing
  const tempCode = dataStr.replace('export const questions =', 'module.exports.questions =');
  fs.writeFileSync('./src/data_temp.cjs', tempCode);
  
  const { questions } = await import('./src/data_temp.cjs');

  // Apply corrections and shuffle
  for (let q of questions) {
    // Apply correction if exists
    if (correctionMap.has(q.id)) {
      const correction = correctionMap.get(q.id);
      if (correction.correctAnswer) {
        q.correctAnswer = correction.correctAnswer;
      }
      if (correction.explanation) {
        q.explanation = correction.explanation;
      }
    }

    // Shuffle options
    const optionKeys = ['A', 'B', 'C', 'D'];
    const optionValues = [q.options.A, q.options.B, q.options.C, q.options.D];
    const correctAnswerText = q.options[q.correctAnswer];

    // Create array of pairs to shuffle
    let pairs = optionKeys.map((k, i) => ({ key: k, val: optionValues[i] }));
    
    // Fisher-Yates shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    // Rebuild options object and find new correct answer
    let newOptions = {};
    let newCorrectAnswer = 'A';
    for (let i = 0; i < 4; i++) {
      newOptions[optionKeys[i]] = pairs[i].val;
      if (pairs[i].val === correctAnswerText) {
        newCorrectAnswer = optionKeys[i];
      }
    }

    q.options = newOptions;
    q.correctAnswer = newCorrectAnswer;
  }

  // Write back to data.js
  const finalStr = `export const questions = ${JSON.stringify(questions, null, 2)};\n`;
  fs.writeFileSync(DATA_FILE, finalStr);
  console.log('Successfully applied corrections and shuffled options.');
  
  // Print new distribution
  let stats = {A: 0, B: 0, C: 0, D: 0};
  for (let q of questions) {
    if (stats[q.correctAnswer] !== undefined) {
      stats[q.correctAnswer]++;
    }
  }
  console.log('New Answer Distribution:', stats);
}

main();
