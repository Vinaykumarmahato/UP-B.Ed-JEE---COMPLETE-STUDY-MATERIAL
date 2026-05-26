import fs from 'fs';
import { questions as currentQuestions } from './src/data.js';

// Read the original chunk 19
const originalChunk = JSON.parse(fs.readFileSync('./chunks/chunk_19.json', 'utf8'));
// Read the newly created corrections_19.json
const corrections = JSON.parse(fs.readFileSync('./chunks/corrections_19.json', 'utf8'));

let fixesApplied = 0;

for (let correction of corrections) {
  // Find the question in the original chunk to get the exact text of the correct answer
  const originalQuestion = originalChunk.find(q => q.id === correction.id);
  if (!originalQuestion) continue;
  
  const correctText = originalQuestion.options[correction.correctAnswer];
  
  // Find the question in the current data.js
  const currentQuestion = currentQuestions.find(q => q.id === correction.id);
  if (!currentQuestion) continue;
  
  // Find which option key currently holds that correct text
  let newCorrectKey = 'A';
  for (let [key, val] of Object.entries(currentQuestion.options)) {
    if (val === correctText) {
      newCorrectKey = key;
      break;
    }
  }
  
  console.log(`Fixing Q${correction.id}: Old Answer was '${currentQuestion.correctAnswer}', changing to '${newCorrectKey}' (${correctText})`);
  currentQuestion.correctAnswer = newCorrectKey;
  if (correction.explanation) {
    currentQuestion.explanation = correction.explanation;
  }
  fixesApplied++;
}

if (fixesApplied > 0) {
  // Rewrite data.js just like apply_fixes2 did
  let dataStr = fs.readFileSync('./src/data.js', 'utf8');
  // We can just regex replace the questions array, or simply rewrite the whole file
  // Wait, importing and then JSON.stringify works, but let's read the rest of the file
  import('./src/data.js').then(module => {
    let finalStr = `export const questions = ${JSON.stringify(currentQuestions, null, 2)};\n\n`;
    finalStr += `export const studyPlan = ${JSON.stringify(module.studyPlan, null, 2)};\n\n`;
    finalStr += `export const aiPredictions = ${JSON.stringify(module.aiPredictions, null, 2)};\n\n`;
    finalStr += `export const frequencyData = ${JSON.stringify(module.frequencyData, null, 2)};\n\n`;
    finalStr += `export const subjectFrequencies = ${JSON.stringify(module.subjectFrequencies, null, 2)};\n`;
    fs.writeFileSync('./src/data.js', finalStr);
    console.log(`Successfully applied ${fixesApplied} late corrections from chunk 19.`);
  });
} else {
  console.log('No fixes needed or valid in chunk 19.');
}
