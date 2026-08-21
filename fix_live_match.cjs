const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

function replaceAll(target, replacement) {
  content = content.split(target).join(replacement);
}

// 1. the main container padding/margins
const tileStart = `<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">`;
const newTileStart = `<div className="bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-none sm:rounded-2xl border-y sm:border border-slate-200 dark:border-slate-800 shadow-xl transition-colors -mx-4 sm:mx-0">`;
replaceAll(tileStart, newTileStart);

// 2. top header details
const headerDetailsStart = `<div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-4">`;
const newHeaderDetailsStart = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3 sm:gap-4">`;
replaceAll(headerDetailsStart, newHeaderDetailsStart);

const gap8Div = `<div className="flex gap-8">`;
const gap8DivRep = `<div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">`;
replaceAll(gap8Div, gap8DivRep);

// 3. Player names and averages
const mb8Details = `<div className="flex justify-between items-center mb-8">`;
const mb8DetailsRep = `<div className="flex justify-between items-center mb-4 sm:mb-8">`;
replaceAll(mb8Details, mb8DetailsRep);

const p1Text3xl = `<h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">`;
const p1Text3xlRep = `<h3 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">`;
replaceAll(p1Text3xl, p1Text3xlRep);

const divider = `<div className="w-px h-16 bg-slate-100 dark:bg-slate-800 mx-8" />`;
const dividerRep = `<div className="w-px h-16 bg-slate-100 dark:bg-slate-800 mx-2 sm:mx-8" />`;
replaceAll(divider, dividerRep);

// 4. Score grids
const gridCols2 = `<div className="grid grid-cols-2 gap-6 mb-8">`;
const gridCols2Rep = `<div className="grid grid-cols-2 gap-2 sm:gap-6 mb-4 sm:mb-8">`;
replaceAll(gridCols2, gridCols2Rep);

// P1 Box
const p1Box = `className={cn(
                                "bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl text-center transition-all",`;
const p1BoxRep = `className={cn(
                                "bg-slate-50 dark:bg-slate-800/30 p-2 sm:p-6 rounded-xl sm:rounded-2xl text-center transition-all",`;
replaceAll(p1Box, p1BoxRep);

// P2 Box
const p2Box = `className={cn(
                                "bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl text-center transition-all",`;
const p2BoxRep = `className={cn(
                                "bg-yellow-50 dark:bg-yellow-900/10 p-2 sm:p-6 rounded-xl sm:rounded-2xl text-center transition-all",`;
replaceAll(p2Box, p2BoxRep);

// Inside boxes
const gap10Score = `<div className="flex justify-center items-center gap-10 mb-1">`;
const gap10ScoreRep = `<div className="flex justify-center items-center gap-2 sm:gap-10 mb-1">`;
replaceAll(gap10Score, gap10ScoreRep);

const p1Text6xl = `<div className="text-6xl font-black text-slate-800 dark:text-slate-100">`;
const p1Text6xlRep = `<div className="text-3xl sm:text-6xl font-black text-slate-800 dark:text-slate-100">`;
replaceAll(p1Text6xl, p1Text6xlRep);

const p2Text6xl = `<div className="text-6xl font-black text-yellow-600 dark:text-yellow-400">`;
const p2Text6xlRep = `<div className="text-3xl sm:text-6xl font-black text-yellow-600 dark:text-yellow-400">`;
replaceAll(p2Text6xl, p2Text6xlRep);

const h12Divider = `<div className="w-px h-12 bg-slate-200 dark:bg-slate-700 opacity-50" />`;
const h12DividerRep = `<div className="w-px h-8 sm:h-12 bg-slate-200 dark:bg-slate-700 opacity-50" />`;
replaceAll(h12Divider, h12DividerRep);

const h12YellowDivider = `<div className="w-px h-12 bg-yellow-400/30" />`;
const h12YellowDividerRep = `<div className="w-px h-8 sm:h-12 bg-yellow-400/30" />`;
replaceAll(h12YellowDivider, h12YellowDividerRep);

const p1CurrentTurn = `<div className="text-lg font-black text-emerald-600 dark:text-emerald-400">`;
const p1CurrentTurnRep = `<div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">`;
replaceAll(p1CurrentTurn, p1CurrentTurnRep);

const p2CurrentTurn = `<div className="text-lg font-black text-yellow-600 dark:text-yellow-400">`;
const p2CurrentTurnRep = `<div className="text-base sm:text-lg font-black text-yellow-600 dark:text-yellow-400">`;
replaceAll(p2CurrentTurn, p2CurrentTurnRep);

// Grid for Hoogste/Gem
const p1SmallGrid = `<div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">`;
const p1SmallGridRep = `<div className="grid grid-cols-2 gap-1 sm:gap-2 pt-2 sm:pt-4 border-t border-slate-100 dark:border-slate-800">`;
replaceAll(p1SmallGrid, p1SmallGridRep);

const p2SmallGrid = `<div className="grid grid-cols-2 gap-2 pt-4 border-t border-yellow-100 dark:border-yellow-900/30">`;
const p2SmallGridRep = `<div className="grid grid-cols-2 gap-1 sm:gap-2 pt-2 sm:pt-4 border-t border-yellow-100 dark:border-yellow-900/30">`;
replaceAll(p2SmallGrid, p2SmallGridRep);

const p1SmallGridText = `<p className="text-2xl font-black text-slate-700 dark:text-slate-300">`;
const p1SmallGridTextRep = `<p className="text-lg sm:text-2xl font-black text-slate-700 dark:text-slate-300">`;
replaceAll(p1SmallGridText, p1SmallGridTextRep);

const p2SmallGridText = `<p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">`;
const p2SmallGridTextRep = `<p className="text-lg sm:text-2xl font-black text-yellow-700 dark:text-yellow-300">`;
replaceAll(p2SmallGridText, p2SmallGridTextRep);

// 5. Input container
const inputContainer = `<div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative">`;
const inputContainerRep = `<div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 relative">`;
replaceAll(inputContainer, inputContainerRep);


fs.writeFileSync('src/App.tsx', content);
console.log("Replaced UI in Live Match.");
