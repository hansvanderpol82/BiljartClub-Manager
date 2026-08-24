import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    
    const bandSeason = data.seasons.find(s => s.name.includes("Bandstoten 2026"));
    const antoon = data.users.find(u => u.name === "Antoon");
    
    const matches = data.matches.filter(m => m.seasonId === bandSeason.id);
    let antoonAntoon = 0;
    matches.forEach(m => {
        if (m.player1Id === antoon.id && m.player2Id === antoon.id) {
            antoonAntoon++;
        }
    });
    console.log("Antoon vs Antoon matches:", antoonAntoon);
    
    // Check members in the season
    console.log("Season members:", bandSeason.members.length);
    process.exit(0);
}
run();
