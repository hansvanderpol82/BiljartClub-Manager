const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Cast Menu
content = content.replace(
  /<span>Cast Menu<\/span>/g,
  '<span className="hidden sm:inline">Cast Menu</span>'
);

// Herindelen
content = content.replace(
  /<span>Herindelen<\/span>/g,
  '<span className="hidden sm:inline">Herindelen</span>'
);

// Toon/verberg voltooide
content = content.replace(
  /<span>\s*\{\s*showFinishedMatches\s*\?\s*"Verberg voltooide"\s*:\s*"Toon voltooide"\s*\}\s*<\/span>/g,
  '<span className="hidden sm:inline">\n                        {showFinishedMatches\n                          ? "Verberg voltooide"\n                          : "Toon voltooide"}\n                      </span>'
);

fs.writeFileSync('src/App.tsx', content);
