import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        const docRef = doc(db, "appData", "main");
        const snap = await getDoc(docRef);
        const data = JSON.parse(snap.data().data);
        
        const frank = data.users.find(u => u.name.includes("Frank"));
        const hansJrId = "9yaorw2vb"; // Assuming this is Hans jr.
        
        // Find match
        const matchIndex = data.matches.findIndex(m => 
            m.date.startsWith("2026-04-09") &&
            ((m.player1Id === hansJrId && m.player2Id === frank.id) ||
             (m.player1Id === frank.id && m.player2Id === hansJrId))
        );

        if (matchIndex !== -1) {
            const matchToRemove = data.matches[matchIndex];
            data.matches.splice(matchIndex, 1);
            await updateDoc(docRef, { data: JSON.stringify(data) });
            console.log("Removed match:", matchToRemove.id, "on", matchToRemove.date);
        } else {
            console.log("Match not found");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
