const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \{ doc, setDoc \} = await import\("firebase\/firestore"\);\n\s*const \{ db \} = await import\("\.\/lib\/firebase"\);\n\s*const docRef = doc\(db, "appData", "main"\);\n\s*setDoc\(docRef, \{ data: JSON\.stringify\(newData\) \}\)\n\s*\.then\(\(\) => console\.log\("Successfully removed bad matches from Firestore"\)\)\n\s*\.catch\(e => console\.error\("Error removing bad matches", e\)\);/;

const newCode = `import("firebase/firestore").then(({ doc, setDoc }) => {
            import("./lib/firebase").then(({ db }) => {
              const docRef = doc(db, "appData", "main");
              setDoc(docRef, { data: JSON.stringify(newData) })
                .then(() => console.log("Successfully removed bad matches from Firestore"))
                .catch(e => console.error("Error removing bad matches", e));
            });
          });`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Fixed await in App.tsx");
} else {
    console.log("Could not find the await logic to replace.");
}
