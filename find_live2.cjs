const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf-8');
const index = app.indexOf('if (liveMatch)');
if (index === -1) {
    const lines = app.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('liveMatch') && lines[i].includes('return')) {
            console.log(lines[i]);
        }
    }
} else {
    console.log("Found at: " + index);
}
