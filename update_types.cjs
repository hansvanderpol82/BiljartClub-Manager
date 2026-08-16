const fs = require('fs');

let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(
  "role: 'admin' | 'planner' | 'member';",
  "role: 'admin' | 'planner' | 'member';\n  active?: boolean;"
);
fs.writeFileSync('src/types.ts', typesContent, 'utf8');
