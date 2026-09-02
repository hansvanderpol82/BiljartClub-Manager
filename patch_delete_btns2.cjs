const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const seasonReplacement = `                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {currentUser?.email === "info@hans-apps.com" && (
                              <button
                                onClick={() => {
                                  if (window.confirm(\`Weet je zeker dat je het seizoen '\${season.name}' en alle bijbehorende interne wedstrijden wilt verwijderen? Dit kan niet ongedaan worden gemaakt.\`)) {
                                    setData((prev) => ({
                                      ...prev,
                                      seasons: prev.seasons.filter((s) => s.id !== season.id),
                                      matches: prev.matches.filter((m) => m.seasonId !== season.id)
                                    }));
                                  }
                                }}
                                className="px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm font-bold border bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center gap-2"
                                title="Seizoen verwijderen"
                              >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">Verwijderen</span>
                              </button>
                            )}
                            <button`;

const seasonTarget = `                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button`;

if (content.includes(seasonTarget)) {
    content = content.replace(seasonTarget, seasonReplacement);
    console.log("Patched season delete button.");
} else {
    console.log("Could not find season target.");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Patching complete.");
