import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    
    const season = data.seasons.find(s => s.name.includes("Bandstoten 2026"));
    const antoon = data.users.find(u => u.name === "Antoon");
    
    const matches = data.matches.filter(m => m.seasonId === season.id && (m.player1Id === antoon.id || m.player2Id === antoon.id));
    
    console.log(`Found ${matches.length} matches involving Antoon's ID.`);
    
    const sevens = matches.filter(m => m.player1AvgBefore === 7 || m.player2AvgBefore === 7);
    console.log(`Found ${sevens.length} matches with an average of 7.`);
    
    sevens.forEach(m => {
        let p1Car = 0, p2Car = 0;
        (m.turns || []).forEach(t => { p1Car += t.player1; p2Car += t.player2; });
        console.log(`Match ${m.id}: P1(avg=${m.player1AvgBefore}) scored ${p1Car} | P2(avg=${m.player2AvgBefore}) scored ${p2Car}. Status: ${m.status}`);
    });
    
    process.exit(0);
}
run();
