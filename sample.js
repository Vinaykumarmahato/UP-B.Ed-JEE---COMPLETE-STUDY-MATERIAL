import fs from 'fs';
import { questions } from './src/data.js';

// Get a random sample of 20 questions
let sample = [];
for (let i = 0; i < 20; i++) {
  let r = Math.floor(Math.random() * questions.length);
  sample.push(questions[r]);
}

for (let q of sample) {
  console.log(`Q: ${q.text}`);
  console.log(`A: ${q.options['A']} | B: ${q.options['B']} | C: ${q.options['C']} | D: ${q.options['D']}`);
  console.log(`Current Correct: ${q.correctAnswer} (${q.options[q.correctAnswer]})`);
  console.log(`Explanation: ${q.explanation}`);
  console.log('---');
}
