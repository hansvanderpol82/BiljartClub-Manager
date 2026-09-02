import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    try {
        const docRef = doc(db, "appData", "main");
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            console.log("No data found.");
            process.exit(0);
        }
        const data = JSON.parse(snap.data().data);
        
        // Find users
        const hansJr = data.users.find(u => u.name.toLowerCase().includes("hans jr") || u.name.toLowerCase().includes("hans junior"));
        const frank = data.users.find(u => u.name.toLowerCase().includes("frank"));
        
        if (!hansJr || !frank) {
            console.log("Users not found", { hansJr: !!hansJr, frank: !!frank });
            console.log("Users available:", data.users.map(u => u.name).join(", "));
            process.exit(0);
        }

        console.log("Found users:", hansJr.name, "(", hansJr.id, ") and", frank.name, "(", frank.id, ")");

        // Find match
        const matchIndex = data.matches.findIndex(m => 
            m.date.startsWith("2026-04-09") &&
            ((m.player1Id === hansJr.id && m.player2Id === frank.id) ||
             (m.player1Id === frank.id && m.player2Id === hansJr.id))
        );

        if (matchIndex !== -1) {
            const matchToRemove = data.matches[matchIndex];
            data.matches.splice(matchIndex, 1);
            await updateDoc(docRef, { data: JSON.stringify(data) });
            console.log("Removed match:", matchToRemove.id, "on", matchToRemove.date);
        } else {
            console.log("Match not found for these players on 2026-04-09");
            // Let's print dates for matches between them
            const theirMatches = data.matches.filter(m => 
                (m.player1Id === hansJr.id && m.player2Id === frank.id) ||
                (m.player1Id === frank.id && m.player2Id === hansJr.id)
            );
            console.log("Existing matches between them:", theirMatches.map(m => m.date).join(", "));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
