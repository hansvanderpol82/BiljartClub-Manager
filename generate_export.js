import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    
    const userMap = new Map((data.users || []).map(u => [u.id, u.name]));
    const clubMap = new Map((data.clubs || []).map(c => [c.id, c.name]));
    const seasonMap = new Map((data.seasons || []).map(s => [s.id, s.name]));

    const internalMatches = [];
    const externalMatchesRows = [];

    // Process Internal Matches
    (data.matches || []).forEach(m => {
        if (m.status !== 'finished') return;
        const row = {
            "Seizoen": seasonMap.get(m.seasonId) || m.seasonId,
            "Datum": m.date ? new Date(m.date).toLocaleDateString('nl-NL') : '',
            "Speler 1": userMap.get(m.player1Id) || m.player1Id,
            "Speler 2": userMap.get(m.player2Id) || m.player2Id,
            "Score Speler 1": m.player1Score || 0,
            "Score Speler 2": m.player2Score || 0,
            "Beurten Totaal": (m.turns || []).length,
            "Arbiter": userMap.get(m.arbiterId) || m.arbiterId || '',
            "Schrijver": userMap.get(m.writerId) || m.writerId || ''
        };

        // Add turns
        (m.turns || []).forEach((t, i) => {
            row[`Beurt ${i + 1} (Speler 1)`] = t.player1 !== undefined ? t.player1 : '';
            row[`Beurt ${i + 1} (Speler 2)`] = t.player2 !== undefined ? t.player2 : '';
        });

        internalMatches.push(row);
    });

    // Process External Matches
    (data.externalMatches || []).forEach(em => {
        const homeClub = clubMap.get(em.homeClubId) || em.homeClubId;
        const awayClub = clubMap.get(em.awayClubId) || em.awayClubId;
        const seasonName = seasonMap.get(em.seasonId) || em.seasonId;
        const dateStr = em.date ? new Date(em.date).toLocaleDateString('nl-NL') : '';

        (em.games || []).forEach(g => {
            if (g.status !== 'finished') return;
            const row = {
                "Seizoen": seasonName,
                "Datum": dateStr,
                "Thuis Club": homeClub,
                "Uit Club": awayClub,
                "Thuis Speler": userMap.get(g.homePlayerId) || g.homePlayerId,
                "Uit Speler": userMap.get(g.awayPlayerId) || g.awayPlayerId,
                "Score Thuis": g.homeScore || 0,
                "Score Uit": g.awayScore || 0,
                "Beurten Totaal": (g.turns || []).length,
                "Arbiter": userMap.get(g.arbiterId) || g.arbiterId || '',
                "Schrijver": userMap.get(g.writerId) || g.writerId || ''
            };

            // Add turns
            (g.turns || []).forEach((t, i) => {
                row[`Beurt ${i + 1} (Thuis)`] = t.player1 !== undefined ? t.player1 : '';
                row[`Beurt ${i + 1} (Uit)`] = t.player2 !== undefined ? t.player2 : '';
            });

            externalMatchesRows.push(row);
        });
    });

    // Create Worksheets
    const wb = xlsx.utils.book_new();
    
    if (internalMatches.length > 0) {
        const wsInternal = xlsx.utils.json_to_sheet(internalMatches);
        xlsx.utils.book_append_sheet(wb, wsInternal, "Interne Wedstrijden");
    }
    
    if (externalMatchesRows.length > 0) {
        const wsExternal = xlsx.utils.json_to_sheet(externalMatchesRows);
        xlsx.utils.book_append_sheet(wb, wsExternal, "Uitwisselingswedstrijden");
    }

    // Save File
    const outputPath = path.join(process.cwd(), "public", "Biljart_Export.xlsx");
    xlsx.writeFile(wb, outputPath);
    
    console.log("Export saved to", outputPath);
    process.exit(0);
}

run().catch(console.error);
