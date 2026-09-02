import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, FileSpreadsheet, Plus, X } from 'lucide-react';
import { Club, User, Season, Match } from '../types';
import { format } from 'date-fns';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ExcelModule({ activeClub, currentUser, data, setData }: any) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template Form State
  const [seasonName, setSeasonName] = useState("");
  const [scoringSystem, setScoringSystem] = useState<"default" | "driebanden">("default");
  const [matchesPerPair, setMatchesPerPair] = useState(2);
  const [inlegPerWedstrijd, setInlegPerWedstrijd] = useState(1);
  const [contributie, setContributie] = useState(10);
  const [beurtenPerWedstrijd, setBeurtenPerWedstrijd] = useState(30);

  const hasAccess = 
    (activeClub && (activeClub.adminId === currentUser.id || (activeClub.coAdminEmails || []).includes(currentUser.email))) ||
    currentUser.role === 'applicatiebeheerder' ||
    currentUser.email === 'info@hans-apps.com';

  if (!hasAccess) return null;

  const handleExportClub = () => {
    if (!activeClub) return;
    const wb = XLSX.utils.book_new();

    // 1. Members
    const clubMembers = data.users.filter((u: User) => activeClub.memberIds?.includes(u.id) && selectedMembers.includes(u.id));
    const membersSheet = XLSX.utils.json_to_sheet(clubMembers.map((u: User) => ({
      Naam: u.name,
      KorteNaam: u.shortName || "",
      Email: u.email,
      StartMoyenne: u.baseAverage
    })));
    XLSX.utils.book_append_sheet(wb, membersSheet, "Leden");

    // 2. Seasons
    const clubSeasons = data.seasons.filter((s: Season) => s.clubId === activeClub.id);
    const seasonsSheet = XLSX.utils.json_to_sheet(clubSeasons.map((s: Season) => ({
      Naam: s.name,
      Status: s.status,
      Inleg: s.inlegPerWedstrijd,
      Contributie: s.contributie,
      Scoring: s.scoringSystem || "default"
    })));
    XLSX.utils.book_append_sheet(wb, seasonsSheet, "Seizoenen");

    // 3. Matches
    const clubSeasonIds = clubSeasons.map((s: Season) => s.id);
    const clubMatches = data.matches.filter((m: Match) => clubSeasonIds.includes(m.seasonId));
    const matchesSheet = XLSX.utils.json_to_sheet(clubMatches.map((m: Match) => {
      const p1 = data.users.find((u: User) => u.id === m.player1Id)?.name;
      const p2 = data.users.find((u: User) => u.id === m.player2Id)?.name;
      const s = clubSeasons.find((s: Season) => s.id === m.seasonId)?.name;
      return {
        Seizoen: s,
        Datum: m.date,
        Speler1: p1,
        Speler2: p2,
        Score1: m.player1Score,
        Score2: m.player2Score,
        Beurten1: m.player1Beurten,
        Beurten2: m.player2Beurten,
        Status: m.status
      }
    }));
    XLSX.utils.book_append_sheet(wb, matchesSheet, "Wedstrijden");

    XLSX.writeFile(wb, `Export_${activeClub.name.replace(/\\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const generateTemplate = () => {
    if (!seasonName.trim()) {
      alert("Vul een seizoen naam in.");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Sheet 1: Info (Read-only for config)
    const infoData = [
      ["Eigenschap", "Waarde"],
      ["Seizoen Naam", seasonName],
      ["Scoring Systeem", scoringSystem],
      ["Wedstrijden per Paar", matchesPerPair],
      ["Inleg per Wedstrijd", inlegPerWedstrijd],
      ["Contributie", contributie],
      ["Beurten", beurtenPerWedstrijd]
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, infoSheet, "Seizoen Info");

    // Sheet 2: Spelers
    const spelersData = [
      ["Naam (Exact)", "Start Moyenne", "Contributie Betaald (Ja/Nee)"]
    ];
    // Add existing members as pre-filled rows to make it easy
    const clubMembers = data.users.filter((u: User) => activeClub.memberIds?.includes(u.id));
    clubMembers.forEach((u: User) => {
      spelersData.push([u.name, u.baseAverage.toString(), "Ja"]);
    });
    const spelersSheet = XLSX.utils.aoa_to_sheet(spelersData);
    XLSX.utils.book_append_sheet(wb, spelersSheet, "Spelers");

    // Sheet 3: Wedstrijden
    const wedstrijdenHeaders = [
      "Datum (DD-MM-YYYY)",
      "Speler 1",
      "Speler 2",
      "Arbiter",
      "Schrijver",
      "Inleg 1 Betaald (Ja/Nee)",
      "Inleg 2 Betaald (Ja/Nee)",
      "Moyenne 1",
      "Moyenne 2"
    ];

    for (let i = 1; i <= beurtenPerWedstrijd; i++) wedstrijdenHeaders.push(`Car. ${i} S1`);
    for (let i = 1; i <= beurtenPerWedstrijd; i++) wedstrijdenHeaders.push(`Car. ${i} S2`);

    const wedstrijdenData = [wedstrijdenHeaders];
    // Pre-fill matches based on matchesPerPair
    const matchesPerPairNum = parseInt(matchesPerPair, 10) || 1;
    for (let m = 0; m < matchesPerPairNum; m++) {
      for (let i = 0; i < clubMembers.length; i++) {
        for (let j = i + 1; j < clubMembers.length; j++) {
          const row = Array(wedstrijdenHeaders.length).fill("");
          row[1] = clubMembers[i].name;
          row[2] = clubMembers[j].name;
          row[5] = "Ja"; // Inleg 1 Betaald
          row[6] = "Ja"; // Inleg 2 Betaald
          row[7] = clubMembers[i].baseAverage.toString();
          row[8] = clubMembers[j].baseAverage.toString();
          wedstrijdenData.push(row);
        }
      }
    }

    const wedstrijdenSheet = XLSX.utils.aoa_to_sheet(wedstrijdenData);
    XLSX.utils.book_append_sheet(wb, wedstrijdenSheet, "Wedstrijden");

    XLSX.writeFile(wb, `Invulsheet_${seasonName.replace(/\\s+/g, '_')}.xlsx`);
    setShowTemplateModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        if (!wb.SheetNames.includes("Seizoen Info") || !wb.SheetNames.includes("Spelers") || !wb.SheetNames.includes("Wedstrijden")) {
          throw new Error("Ongeldig bestand. Zorg dat de sheets 'Seizoen Info', 'Spelers' en 'Wedstrijden' bestaan.");
        }

        const infoSheet = XLSX.utils.sheet_to_json(wb.Sheets["Seizoen Info"], { header: 1 }) as any[][];
        const spelersSheet = XLSX.utils.sheet_to_json(wb.Sheets["Spelers"]) as any[];
        const wedstrijdenSheet = XLSX.utils.sheet_to_json(wb.Sheets["Wedstrijden"]) as any[];

        // Parse Info
        const infoMap: Record<string, any> = {};
        infoSheet.forEach(row => {
          if (row.length >= 2) {
            infoMap[row[0]] = row[1];
          }
        });

        const sName = infoMap["Seizoen Naam"];
        if (!sName) throw new Error("Seizoen Naam ontbreekt in 'Seizoen Info'.");

        const sScoring = infoMap["Scoring Systeem"] === "driebanden" ? "driebanden" : "default";
        const sMatches = parseInt(infoMap["Wedstrijden per Paar"]) || 2;
        const sInleg = parseFloat(infoMap["Inleg per Wedstrijd"]) || 0;
        const sContributie = parseFloat(infoMap["Contributie"]) || 0;
        const sBeurten = parseInt(infoMap["Beurten"]) || 30;

        // Collect new users or map existing
        let updatedUsers = [...data.users];
        const userMap: Record<string, string> = {}; // naam -> id

        const newSeasonMembers: any[] = [];
        for (const sp of spelersSheet) {
          const naam = sp["Naam (Exact)"];
          if (!naam) continue;
          
          let user = updatedUsers.find(u => u.name.toLowerCase() === naam.toLowerCase());
          if (!user) {
            const newId = 'imported_' + Math.random().toString(36).substr(2, 9);
            user = {
              id: newId,
              name: naam,
              email: `${naam.replace(/\s+/g, '').toLowerCase()}@imported.local`,
              role: 'member',
              baseAverage: parseFloat(sp["Start Moyenne"]) || 0,
              active: true
            };
            updatedUsers.push(user);
          }
          userMap[naam.toLowerCase()] = user.id;

          newSeasonMembers.push({
            userId: user.id,
            currentAverage: parseFloat(sp["Start Moyenne"]) || 0,
            paidContributie: sp["Contributie Betaald (Ja/Nee)"]?.toLowerCase() === 'ja'
          });
        }

        // Create Season
        const newSeasonId = 'season_' + Math.random().toString(36).substr(2, 9);
        const newSeason: Season = {
          id: newSeasonId,
          clubId: activeClub.id,
          name: sName,
          status: 'closed', // Imported seasons are typically closed
          isBlocked: true,
          members: newSeasonMembers,
          scoringSystem: sScoring,
          matchesPerPair: sMatches,
          inlegPerWedstrijd: sInleg,
          contributie: sContributie,
          beurtenPerWedstrijd: sBeurten,
          speeldagen: [],
          wedstrijdenPerSpeeldag: 2,
          herzieningenPerSeizoen: 2,
          aantalTafels: 1
        };

        // Create Matches
        const newMatches: Match[] = [];
        for (const w of wedstrijdenSheet) {
          const p1Name = w["Speler 1"];
          const p2Name = w["Speler 2"];
          if (!p1Name || !p2Name) continue;

          const p1Id = userMap[p1Name.toLowerCase()];
          const p2Id = userMap[p2Name.toLowerCase()];
          if (!p1Id || !p2Id) {
            console.warn(`Kan speler niet vinden voor wedstrijd: ${p1Name} vs ${p2Name}`);
            continue;
          }
          
          let arbiterId = undefined;
          if (w["Arbiter"]) {
             arbiterId = userMap[w["Arbiter"].toString().toLowerCase()];
          }
          let writerId = undefined;
          if (w["Schrijver"]) {
             writerId = userMap[w["Schrijver"].toString().toLowerCase()];
          }
          
          let p1Avg = parseFloat(w["Moyenne 1"]);
          if (isNaN(p1Avg)) p1Avg = newSeasonMembers.find(m => m.userId === p1Id)?.currentAverage || 0;
          let p2Avg = parseFloat(w["Moyenne 2"]);
          if (isNaN(p2Avg)) p2Avg = newSeasonMembers.find(m => m.userId === p2Id)?.currentAverage || 0;

          // Parse turns
          const turns = [];
          let p1Total = 0;
          let p2Total = 0;
          let p1BeurtCount = 0;
          let p2BeurtCount = 0;
          
          for (let i = 1; i <= sBeurten; i++) {
             const c1Str = w[`Car. ${i} S1`];
             const c2Str = w[`Car. ${i} S2`];
             
             let p1 = 0;
             let p2 = 0;
             let hasTurn = false;
             
             if (c1Str !== undefined && c1Str !== '') {
                 p1 = parseInt(c1Str) || 0;
                 p1Total += p1;
                 p1BeurtCount++;
                 hasTurn = true;
             }
             if (c2Str !== undefined && c2Str !== '') {
                 p2 = parseInt(c2Str) || 0;
                 p2Total += p2;
                 p2BeurtCount++;
                 hasTurn = true;
             }
             
             if (hasTurn) {
                 turns.push({ player1: p1, player2: p2 });
             }
          }
          
          

          const mId = 'match_' + Math.random().toString(36).substr(2, 9);
          newMatches.push({
            id: mId,
            seasonId: newSeasonId,
            clubId: activeClub.id,
            date: (() => {
              let d = w["Datum (DD-MM-YYYY)"] || w["Datum (YYYY-MM-DD)"];
              if (d) {
                // If excel parsed it as a number (serial date)
                if (typeof d === 'number') {
                  const date = new Date(Math.round((d - 25569)*86400*1000));
                  return date.toISOString().split('T')[0];
                }
                // If it's a string like DD-MM-YYYY
                if (typeof d === 'string' && d.includes('-')) {
                  const parts = d.split('-');
                  if (parts[0].length === 2 && parts[2].length === 4) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                  }
                }
                // Fallback to the string as-is (might be YYYY-MM-DD already)
                return String(d);
              }
              return new Date().toISOString().split('T')[0];
            })(),
            player1Id: p1Id,
            player2Id: p2Id,
            arbiterId: arbiterId,
            writerId: writerId,
            status: 'finished',
            player1AvgBefore: p1Avg,
            player2AvgBefore: p2Avg,
            player1Score: p1Total,
            player2Score: p2Total,
            player1Beurten: p1BeurtCount,
            player2Beurten: p2BeurtCount,
            turns: turns,
            player1Paid: w["Inleg 1 Betaald (Ja/Nee)"]?.toString().toLowerCase() === 'ja',
            player2Paid: w["Inleg 2 Betaald (Ja/Nee)"]?.toString().toLowerCase() === 'ja'
          } as Match);
        }

        // Add club members if not present
        const updatedClubs = data.clubs.map((c: Club) => {
          if (c.id === activeClub.id) {
            const currentMembers = new Set(c.memberIds || []);
            Object.values(userMap).forEach(id => currentMembers.add(id));
            return { ...c, memberIds: Array.from(currentMembers) };
          }
          return c;
        });

        setData((prev: any) => ({
          ...prev,
          users: updatedUsers,
          clubs: updatedClubs,
          seasons: [...prev.seasons, newSeason],
          matches: [...prev.matches, ...newMatches]
        }));

        setImportSuccess(`Succesvol '${sName}' geïmporteerd met ${newMatches.length} wedstrijden!`);
      } catch (err: any) {
        setImportError(err.message || "Er is een fout opgetreden bij het inlezen van het bestand.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 mt-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Excel Export & Import (Beheer)
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Beheer historische data. Maak een invulsheet aan voor voorgaande seizoenen, of exporteer de huidige clubdata.
        </p>
      </div>

      {importError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800">
          {importSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExportClub}
          className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <Download size={24} />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Exporteer Club Data</span>
        </button>

        <button
          onClick={() => {
            const allMembers = data.users.filter((u: User) => activeClub.memberIds?.includes(u.id));
            setSelectedMembers(allMembers.map(u => u.id));
            setShowTemplateModal(true);
          }}
          className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <FileSpreadsheet size={24} />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Aanmaken Invulsheet</span>
        </button>

        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3 cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
              {isImporting ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div> : <Upload size={24} />}
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isImporting ? 'Importeren...' : 'Importeren Invulsheet'}
            </span>
          </label>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-auto border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={24} className="text-blue-500" />
                Nieuwe Invulsheet (Historisch Seizoen)
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Naam Seizoen *
                  </label>
                  <input
                    type="text"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    placeholder="Bijv. Seizoen 2023-2024"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Scoring Systeem
                    </label>
                    <select
                      value={scoringSystem}
                      onChange={(e) => setScoringSystem(e.target.value as any)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    >
                      <option value="default">Libre (Standaard)</option>
                      <option value="driebanden">Driebanden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Wedstrijden per Paar
                    </label>
                    <input
                      type="number"
                      value={matchesPerPair}
                      onChange={(e) => setMatchesPerPair(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Inleg per Wedstrijd (€)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={inlegPerWedstrijd}
                      onChange={(e) => setInlegPerWedstrijd(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contributie (€)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      value={contributie}
                      onChange={(e) => setContributie(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Beurten
                    </label>
                    <input
                      type="number"
                      value={beurtenPerWedstrijd}
                      onChange={(e) => setBeurtenPerWedstrijd(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      Selecteer Leden voor Export
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const allMembers = data.users.filter((u: User) => activeClub.memberIds?.includes(u.id));
                        if (selectedMembers.length === allMembers.length) {
                          setSelectedMembers([]);
                        } else {
                          setSelectedMembers(allMembers.map(u => u.id));
                        }
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedMembers.length === data.users.filter((u: User) => activeClub.memberIds?.includes(u.id)).length ? "Deselecteer alles" : "Selecteer alles"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {data.users.filter((u: User) => activeClub.memberIds?.includes(u.id)).map((user: User) => (
                      <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers(prev => [...prev, user.id]);
                            } else {
                              setSelectedMembers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={user.name}>
                          {user.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={generateTemplate}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Download size={18} />
                Genereer Invulsheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
