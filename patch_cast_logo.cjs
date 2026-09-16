const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Standings
const searchStandings = `        >
          <button
            onClick={() => {
              setIsCastMode(false);`;

const replaceStandings = `        >
          {club?.logo && (
            <div className="absolute top-8 left-8 z-50">
              <img src={club.logo} alt={club.name} className="h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
            </div>
          )}
          <button
            onClick={() => {
              setIsCastMode(false);`;
if (content.includes(searchStandings)) {
  content = content.replace(searchStandings, replaceStandings);
  console.log("Patched Standings.");
}

// 2. Next Match Day (when there are matches)
const searchNextMatch = `            }
          >
            <button
              onClick={() => {
                setIsCastMode(false);
                if (new URLSearchParams(window.location.search).get("cast") === "true") window.close();`;
const replaceNextMatch = `            }
          >
            {club?.logo && (
              <div className="absolute top-8 left-8 z-50">
                <img src={club.logo} alt={club.name} className="h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
              </div>
            )}
            <button
              onClick={() => {
                setIsCastMode(false);
                if (new URLSearchParams(window.location.search).get("cast") === "true") window.close();`;
// Notice that the block above occurs twice in NextMatchDay (one for "Geen toekomstige wedstrijden" and one for matches).
// Both can be replaced.
if (content.includes(searchNextMatch)) {
  content = content.replaceAll(searchNextMatch, replaceNextMatch);
  console.log("Patched Next Match Day.");
}

// 3. Ext Match
const searchExtMatch = `          }
        >
          <button
            onClick={() => {
              setIsCastMode(false);`;
const replaceExtMatch = `          }
        >
          {club?.logo && (
            <div className="absolute top-8 left-8 z-50">
              <img src={club.logo} alt={club.name} className="h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
            </div>
          )}
          <button
            onClick={() => {
              setIsCastMode(false);`;

// Wait, the Ext Match definition looks like this:
/*
    const extMatch = data.externalMatches.find(...)
    if (extMatch) {
       // but does it define `club`? Let's check line 4773-4780
*/
fs.writeFileSync('src/App.tsx', content);
