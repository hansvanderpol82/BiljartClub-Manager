const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                                    {Array.from(
                                      new Set(
                                        data.clubs.map((c: Club) => c.id),
                                      ),
                                    ).map((clubId) => {`;

const replace = `                                    {Array.from(
                                      new Set(
                                        appUserClubs.map((c: Club) => c.id),
                                      ),
                                    ).map((clubId) => {`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched history club dropdown");
} else {
  console.log("Failed to find history club dropdown");
}
