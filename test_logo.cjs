const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Just doing a quick check to see if we can easily insert the logo div.
console.log("File loaded. Checking if <X size={24} /> is present everywhere.");
