const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.clubs.map((club: Club) => (
                    <div`;

const replace = `                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appUserClubs.map((club: Club) => (
                    <div`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched render clubs map");
} else {
  console.log("Failed to find render clubs map");
}
