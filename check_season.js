import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "biljart-club-manager",
  appId: "1:744239322101:web:6ac63c76581cebb03486bc",
  apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    const bandSeasons = data.seasons.filter(s => s.name.includes("Bandstoten 2026"));
    
    for (const s of bandSeasons) {
        console.log(`Season ${s.name} members:`, s.members.length);
        for (const m of s.members) {
            const u = data.users.find(u => u.id === m.userId);
            if (!u) {
                console.log(`  Missing user object for ID: ${m.userId}`);
            } else {
                console.log(`  User: ${u.name}`);
            }
        }
    }
    process.exit(0);
}
run();
