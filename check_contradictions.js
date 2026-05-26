import fs from 'fs';
import { questions } from './src/data.js';

let contradictory = [];

for (let q of questions) {
  let exp = q.explanation || '';
  // Check if explanation explicitly mentions another option as correct
  // like "विकल्प B सही है" but correctAnswer is 'A'
  
  let otherOptions = ['A', 'B', 'C', 'D'].filter(o => o !== q.correctAnswer);
  for (let o of otherOptions) {
    if (exp.includes(`विकल्प ${o}`) || exp.includes(`Option ${o}`) || exp.includes(`option ${o}`)) {
      contradictory.push({id: q.id, recorded: q.correctAnswer, mentions: o, text: q.text, exp: exp});
    }
  }
}

console.log(`Found ${contradictory.length} contradictory explanations.`);
if (contradictory.length > 0) {
  console.log(contradictory.slice(0, 5));
}
