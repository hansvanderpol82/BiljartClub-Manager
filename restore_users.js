import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

async function run() {
    const mainRef = doc(db, "appData", "main");
    const snap = await getDoc(mainRef);
    const data = JSON.parse(snap.data().data);
    
    const kot = data.clubs.find(c => c.name.includes("K.O.T."));
    const bandSeason = data.seasons.find(s => s.name.includes("Bandstoten 2026"));
    
    const usersToCreate = ["Martien", "Yasar", "Yusuf"];
    
    for (const name of usersToCreate) {
        // Only create if not already exists
        let u = data.users.find(u => u.name === name);
        if (!u) {
            u = {
                id: generateId(),
                name: name,
                shortName: name,
                email: "",
                role: "member",
                active: true,
                baseAverage: 20
            };
            data.users.push(u);
            console.log(`Created user ${name} with ID ${u.id}`);
        }
        
        // Add to club
        if (!kot.memberIds.includes(u.id)) {
            kot.memberIds.push(u.id);
            console.log(`Added ${name} to K.O.T.`);
        }
        
        // Add to season
        if (!bandSeason.members.some(m => m.userId === u.id)) {
            bandSeason.members.push({
                userId: u.id,
                currentAverage: 20,
                paidContributie: false
            });
            console.log(`Added ${name} to Bandstoten 2026`);
        }
    }
    
    await setDoc(mainRef, { data: JSON.stringify(data) });
    console.log("Saved restored data");
    process.exit(0);
}
run();
