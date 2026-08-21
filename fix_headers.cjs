const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix 1: Page title
content = content.replace(
  '{activeTab === "matches" &&\n                `Wedstrijden ${activeSeason ? `(${activeSeason.name})` : ""}`}',
  '{activeTab === "matches" &&\n                `Wedstrijden ${activeSeason ? `(${activeSeason.name})` : ""}`}\n              {activeTab === "external-matches-games" &&\n                `Uit & Thuis Wedstrijden`}'
);
content = content.replace(
  '{activeTab === "matches" &&\n                `Wedstrijden ${activeSeason ? `(${activeSeason.name})` : ""}`}',
  '{activeTab === "matches" &&\n                `Wedstrijden ${activeSeason ? `(${activeSeason.name})` : ""}`}\n              {activeTab === "external-matches-games" &&\n                `Uit & Thuis Wedstrijden`}'
);

// We might have missed the EXACT spacing, let's use a regex
content = content.replace(/\{activeTab === "matches" &&[\s\S]*?\`\}/, match => {
  return match + '\n              {activeTab === "external-matches-games" &&\n                `Uit & Thuis Wedstrijden`}';
});

// Fix 2: Cast Menu buttons
content = content.replace(
  '{activeTab === "matches" &&\n              !liveMatchId &&\n              (selectedSeasonId || selectedExternalMatchId) && (',
  '{(activeTab === "matches" || activeTab === "external-matches-games") &&\n              !liveMatchId &&\n              (selectedSeasonId || selectedExternalMatchId) && ('
);

// Fix 3: New Match Button
content = content.replace(
  '{activeTab === "matches" &&\n              !liveMatchId &&\n              selectedSeasonId &&\n              (isClubAdmin(activeClub, currentUser) ||\n                currentUser.role === "admin" ||\n                currentUser.role === "planner") && (',
  '{(activeTab === "matches" || activeTab === "external-matches-games") &&\n              !liveMatchId &&\n              selectedSeasonId &&\n              (isClubAdmin(activeClub, currentUser) ||\n                currentUser.role === "admin" ||\n                currentUser.role === "planner") && ('
);

fs.writeFileSync('src/App.tsx', content);
console.log("Headers replaced.");
