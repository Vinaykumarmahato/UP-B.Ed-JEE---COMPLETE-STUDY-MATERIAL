import fs from 'fs';
import { questions } from './src/data.js';

let errors = [];
let validKeys = ['A', 'B', 'C', 'D'];

for (let q of questions) {
  if (!q.correctAnswer) {
    errors.push(`Q${q.id}: Missing correctAnswer`);
  } else if (!validKeys.includes(q.correctAnswer)) {
    errors.push(`Q${q.id}: Invalid correctAnswer key '${q.correctAnswer}'`);
  }
  
  if (!q.options[q.correctAnswer]) {
    errors.push(`Q${q.id}: correctAnswer '${q.correctAnswer}' does not exist in options`);
  }

  // Check if explanation contains the correct answer. Often explanations say "A is correct..." or something, but we can't be sure.
}

console.log(`Found ${errors.length} structural errors.`);
if (errors.length > 0) {
  console.log(errors.slice(0, 20).join('\n'));
}

// Let's also check if all correct answers are just 'A' or something weird like that.
let stats = {A: 0, B: 0, C: 0, D: 0};
for (let q of questions) {
  if (stats[q.correctAnswer] !== undefined) {
    stats[q.correctAnswer]++;
  }
}
console.log('Answer distribution:', stats);
