import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const generateId = () => Math.random().toString(36).substr(2, 9);

async function run() {
    const docRef = doc(db, "appData", "main");
    const snap = await getDoc(docRef);
    const data = JSON.parse(snap.data().data);
    
    const myClubId = 'zfpfxl6b4'; // Biljartclub K.O.T.
    
    // 1. Add club
    const newClubId = generateId();
    data.clubs.push({
        id: newClubId,
        name: "'t Blaauw tûpke",
        logo: "",
        adminId: "1",
        memberIds: ["1"],
        participatesInExternalMatches: true
    });
    
    // 2. Add seasons
    const newSeason1 = {
        id: generateId(),
        name: "testseizoen 2026",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        clubId: myClubId,
        contributie: 50,
        inlegPerWedstrijd: 1,
        members: [],
        attendance: {},
        type: "libre",
        aantalTafels: 1,
        beurtenPerWedstrijd: 10,
        scoringSystem: "default"
    };
    
    const newSeason2 = {
        id: generateId(),
        name: "bandstoten 2026 seizoen",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        clubId: myClubId,
        contributie: 50,
        inlegPerWedstrijd: 1,
        members: [],
        attendance: {},
        type: "bandstoten",
        aantalTafels: 1,
        beurtenPerWedstrijd: 10,
        scoringSystem: "default"
    };
    
    data.seasons.push(newSeason1, newSeason2);
    
    // 3. Add external matches
    if (!data.externalMatches) data.externalMatches = [];
    
    const mainSeasonId = "olbw4ou3o"; // Seizoen 2026
    
    data.externalMatches.push({
        id: generateId(),
        name: "Thuis tegen 't Blaauw tûpke",
        seasonId: mainSeasonId,
        homeClubId: myClubId,
        awayClubId: newClubId,
        date: "2026-09-15",
        status: "planned",
        games: [],
        scoringSystem: "default",
        aantalTafels: 1,
        beurtenPerWedstrijd: 10,
        homePlayerFee: 1,
        awayPlayerFee: 1
    });
    
    data.externalMatches.push({
        id: generateId(),
        name: "Uit tegen 't Blaauw tûpke",
        seasonId: mainSeasonId,
        homeClubId: newClubId,
        awayClubId: myClubId,
        date: "2026-10-15",
        status: "planned",
        games: [],
        scoringSystem: "default",
        aantalTafels: 1,
        beurtenPerWedstrijd: 10,
        homePlayerFee: 1,
        awayPlayerFee: 1
    });
    
    await updateDoc(docRef, {
        data: JSON.stringify(data)
    });
    
    console.log("Restored missing entities successfully!");
    process.exit(0);
}
run();
