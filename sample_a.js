import fs from 'fs';
import { questions } from './src/data.js';

let aQuestions = questions.filter(q => q.correctAnswer === 'A');
let sample = [];
for (let i = 0; i < 10; i++) {
  sample.push(aQuestions[Math.floor(Math.random() * aQuestions.length)]);
}

for (let q of sample) {
  console.log(`Q: ${q.text}`);
  console.log(`Options: A) ${q.options.A} | B) ${q.options.B} | C) ${q.options.C} | D) ${q.options.D}`);
  console.log(`Recorded Answer: ${q.correctAnswer}`);
  console.log('---');
}
