const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove "Actie" header in the second table (the one under <thead className="hidden sm:table-header-group"> after <div className="flex-1 flex flex-col overflow-hidden">, wait no, this is under extMatch?)
// Wait, is this the table at 9546? Let's check.
