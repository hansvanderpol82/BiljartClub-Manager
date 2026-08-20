const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Make th/td smaller on mobile for all tables (py-4 -> py-2 sm:py-4, pl-4 -> pl-2 sm:pl-4, etc.)
// Let's just do a blanket replacement for specific classes inside the tables.

// 2. The overflow containers:
content = content.replace(/className="overflow-x-auto bg/g, 'className="overflow-x-auto -mx-4 sm:mx-0 bg');
content = content.replace(/className="overflow-x-auto rounded-xl border/g, 'className="overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-xl border-y sm:border-x border');
content = content.replace(/className="overflow-x-auto w-full"/g, 'className="overflow-x-auto w-full -mx-4 sm:mx-0"');
content = content.replace(/<div className="overflow-x-auto">/g, '<div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">');


fs.writeFileSync('src/App.tsx', content);
console.log('done tables fix');
