const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <button
                                onClick={() => {
                                  if (currentUser.role === "admin" || currentUser.role === "planner") {
                                    setEditSeasonSpeeldagen(season.speeldagen || []);
                                    setIsEditSpeeldagenModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "text-left p-4 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500",`;

const newGrid = `<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                              <button
                                onClick={() => {
                                  if (currentUser.role === "admin" || currentUser.role === "planner") {
                                    setEditSeasonSpeeldagen(season.speeldagen || []);
                                    setIsEditSpeeldagenModalOpen(true);
                                  }
                                }}
                                className={cn(
                                  "col-span-2 md:col-span-1 text-left p-4 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500",`;

if (content.includes(oldGrid)) {
  content = content.replace(oldGrid, newGrid);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Grid replaced successfully.");
} else {
  console.log("Could not find oldGrid.");
}
