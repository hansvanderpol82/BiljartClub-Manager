import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function findMatches(obj, id, path = "") {
    if (obj === null || obj === undefined) return;
    if (typeof obj === 'string' && obj === id) {
        console.log("Found at path:", path);
    } else if (Array.isArray(obj)) {
        obj.forEach((val, i) => findMatches(val, id, `${path}[${i}]`));
    } else if (typeof obj === 'object') {
        for (const [key, val] of Object.entries(obj)) {
            findMatches(val, id, `${path}.${key}`);
        }
    }
}

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    const targetId = 'oomczifke';
    findMatches(data, targetId, "data");
    process.exit(0);
}
run();
