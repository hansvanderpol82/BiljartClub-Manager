const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf-8');
const index = app.indexOf('if (liveMatchId || isCastMode)');
if (index === -1) {
    const index2 = app.indexOf('if (liveMatchId');
    console.log("Found liveMatchId at: " + index2);
    console.log(app.substring(index2, index2 + 200));
} else {
    console.log("Found at: " + index);
}
