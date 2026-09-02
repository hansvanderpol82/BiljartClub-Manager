const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /import\("firebase\/firestore"\)\.then\(\(\{ doc, updateDoc \}\) => \{[\s\S]*?\}\);/;

const newCode = `const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("./lib/firebase");
          const docRef = doc(db, "appData", "main");
          setDoc(docRef, { data: JSON.stringify(newData) })
            .then(() => console.log("Successfully removed bad matches from Firestore"))
            .catch(e => console.error("Error removing bad matches", e));`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Fixed require in App.tsx");
} else {
    console.log("Could not find the require logic to replace.");
}
