const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import {  LineChart,',
  'import { LayoutGrid } from "lucide-react";\nimport { SeasonOverview } from "./components/SeasonOverview";\nimport {  LineChart,'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed imports");
