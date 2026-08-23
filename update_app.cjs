const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');
let fixed = fs.readFileSync('fixed_kasboek.tsx', 'utf-8');

// The original extracted lines are exactly 6665 to 7050. Let's just find the same block and replace it.
// The easiest is to split the app into lines, take 0 to 6664, append fixed, append the rest.

let lines = app.split('\n');
let before = lines.slice(0, 6664).join('\n');
let after = lines.slice(7050).join('\n'); // 7050 means we skipped 7050 lines (0 to 7049).

fs.writeFileSync('src/App.tsx', before + '\n' + fixed + '\n' + after);
