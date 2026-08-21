const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <button`;

const newGrid = `<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                              <button
                                style={{ gridColumn: '1 / -1' }}
                                className="sm:col-span-1"`;

// Wait, I will just do it more precisely with text replacement.
