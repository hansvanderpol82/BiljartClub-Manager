const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

function replaceAll(target, replacement) {
  content = content.split(target).join(replacement);
}

const inputSize = `"w-36 h-36 rounded-3xl text-6xl font-black text-center outline-none transition-all border-4 shadow-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",`;
const inputSizeRep = `"w-24 h-24 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl text-4xl sm:text-6xl font-black text-center outline-none transition-all border-4 shadow-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",`;
replaceAll(inputSize, inputSizeRep);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced input size in Live Match.");
