import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    
    // The merged user is Antoon
    const antoonId = data.users.find(u => u.name === "Antoon")?.id;
    if (!antoonId) throw new Error("Antoon not found");
    
    // User names and their base averages
    const nameToAvg = {
        "Antoon": 34,
        "Martien": 30,
        "Ad": 7,
        "Jo": 7,
        "Mustafa": 16,
        "Hassan": 26,
        "Yusuf": 15,
        "Yasar": 38
    };
    
    const club = data.clubs.find(c => c.name.includes("K.O.T."));
    const season = data.seasons.find(s => s.name.includes("Bandstoten 2026"));
    
    // Ensure all users exist
    const usersByName = {};
    for (const name of Object.keys(nameToAvg)) {
        let u = data.users.find(u => u.name === name || (u.shortName && u.shortName === name));
        if (!u) {
            u = {
                id: generateId(),
                name: name,
                shortName: name,
                email: "",
                role: "member",
                active: true,
                baseAverage: nameToAvg[name]
            };
            data.users.push(u);
            console.log(`Created user ${name}`);
        }
        usersByName[name] = u;
        
        // Add to club
        if (!club.memberIds.includes(u.id)) {
            club.memberIds.push(u.id);
        }
        // Add to season
        if (!season.members.some(m => m.userId === u.id)) {
            season.members.push({
                userId: u.id,
                currentAverage: nameToAvg[name],
                paidContributie: false
            });
        }
    }
    
    // Now fix matches
    const matchesToFix = data.matches.filter(m => m.seasonId === season.id && (m.player1Id === antoonId || m.player2Id === antoonId));
    console.log(`Fixing ${matchesToFix.length} matches...`);
    
    // Map of averages to user IDs for unambiguous users
    const avgToUserId = {
        34: usersByName["Antoon"].id,
        30: usersByName["Martien"].id,
        16: usersByName["Mustafa"].id,
        26: usersByName["Hassan"].id,
        15: usersByName["Yusuf"].id,
        38: usersByName["Yasar"].id
    };
    
    // Collect all "7" slots
    // slot = { match, isP1: boolean, caramboles: number, hs: number, assignedTo: null }
    const sevenSlots = [];
    
    matchesToFix.forEach(m => {
        if (m.player1AvgBefore === 7 && m.player1Id === antoonId) {
            let car = 0; let hs = 0;
            (m.turns || []).forEach(t => { car += t.player1; if (t.player1 > hs) hs = t.player1; });
            sevenSlots.push({ match: m, isP1: true, car, hs, assignedTo: null });
        }
        if (m.player2AvgBefore === 7 && m.player2Id === antoonId) {
            let car = 0; let hs = 0;
            (m.turns || []).forEach(t => { car += t.player2; if (t.player2 > hs) hs = t.player2; });
            sevenSlots.push({ match: m, isP1: false, car, hs, assignedTo: null });
        }
    });
    
    console.log(`Found ${sevenSlots.length} slots for Ad/Jo`);
    
    // We need to partition sevenSlots into two sets of 9.
    // Set 1 (Ad): total car = 51, hs <= 3. Wait, Ad's HS is 3. Jo's HS is 4.
    // Let's filter partitions.
    
    // Helper to find partition
    let bestPartition = null;
    
    function search(index, adCount, joCount, adCar, joCar, adHS, joHS, currentPartition) {
        if (bestPartition) return; // found one
        
        if (index === sevenSlots.length) {
            if (adCount === 9 && joCount === 9 && adCar === 51 && joCar === 47 && adHS === 3 && joHS === 4) {
                bestPartition = [...currentPartition];
            }
            return;
        }
        
        // Prune if possible
        if (adCount > 9 || joCount > 9) return;
        if (adCar > 51 || joCar > 47) return;
        
        const slot = sevenSlots[index];
        // Ad vs Jo constraint: if this slot is in the same match as another 7 slot, they must be different players.
        // We can just enforce this by checking if the other slot in the same match was already assigned.
        const partnerSlotIndex = sevenSlots.findIndex((s, i) => i < index && s.match.id === slot.match.id);
        
        // Try assigning to Ad
        if (partnerSlotIndex === -1 || currentPartition[partnerSlotIndex] !== 'Ad') {
            const newAdHS = Math.max(adHS, slot.hs);
            if (newAdHS <= 3) {
                currentPartition.push('Ad');
                search(index + 1, adCount + 1, joCount, adCar + slot.car, joCar, newAdHS, joHS, currentPartition);
                currentPartition.pop();
            }
        }
        
        // Try assigning to Jo
        if (partnerSlotIndex === -1 || currentPartition[partnerSlotIndex] !== 'Jo') {
            const newJoHS = Math.max(joHS, slot.hs);
            if (newJoHS <= 4) {
                currentPartition.push('Jo');
                search(index + 1, adCount, joCount + 1, adCar, joCar, adHS, newJoHS, currentPartition);
                currentPartition.pop();
            }
        }
    }
    
    search(0, 0, 0, 0, 0, 0, 0, []);
    
    if (!bestPartition) {
        console.error("Could not find a valid partition for Ad and Jo!");
        // We will just do a fallback, but hopefully it works.
    } else {
        console.log("Found valid partition for Ad and Jo!");
        sevenSlots.forEach((slot, i) => {
            slot.assignedTo = usersByName[bestPartition[i]].id;
        });
    }
    
    // Now apply changes to matches
    let fixed = 0;
    matchesToFix.forEach(m => {
        // Find if it was a 7-slot
        if (m.player1Id === antoonId) {
            if (m.player1AvgBefore === 7 && bestPartition) {
                const s = sevenSlots.find(s => s.match.id === m.id && s.isP1);
                m.player1Id = s.assignedTo;
            } else {
                m.player1Id = avgToUserId[m.player1AvgBefore] || antoonId;
            }
            fixed++;
        }
        if (m.player2Id === antoonId) {
            if (m.player2AvgBefore === 7 && bestPartition) {
                const s = sevenSlots.find(s => s.match.id === m.id && !s.isP1);
                m.player2Id = s.assignedTo;
            } else {
                m.player2Id = avgToUserId[m.player2AvgBefore] || antoonId;
            }
            fixed++;
        }
    });
    
    console.log(`Applied fixes to ${fixed} players in matches.`);
    
    await setDoc(doc(db, "appData", "main"), { data: JSON.stringify(data) });
    console.log("Saved fixed data to Firestore");
    
    process.exit(0);
}
run();
