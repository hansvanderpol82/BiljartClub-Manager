const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

function replaceAll(target, replacement) {
  content = content.split(target).join(replacement);
}

// Match Detail Modal scaling
const grid2gap8 = `<div className="grid grid-cols-2 gap-8">`;
const grid2gap8Rep = `<div className="grid grid-cols-2 gap-4 sm:gap-8">`;
replaceAll(grid2gap8, grid2gap8Rep);

const p4rounded = `<div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">`;
const p4roundedRep = `<div className="bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800">`;
replaceAll(p4rounded, p4roundedRep);

const text2xlFontBlack = `<p className="text-2xl font-black text-slate-800 dark:text-slate-100">`;
const text2xlFontBlackRep = `<p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">`;
replaceAll(text2xlFontBlack, text2xlFontBlackRep);

const text2xlFontBlackWhite = `<p className="text-2xl font-black text-slate-800 dark:text-white">`;
const text2xlFontBlackWhiteRep = `<p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">`;
replaceAll(text2xlFontBlackWhite, text2xlFontBlackWhiteRep);

const flex1overflow = `<div className="flex-1 overflow-y-auto p-8 space-y-8">`;
const flex1overflowRep = `<div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-8">`;
replaceAll(flex1overflow, flex1overflowRep);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced UI in Match Detail Modal.");
