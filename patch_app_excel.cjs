const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import ExcelModule from')) {
  // Find a good place to put the import, e.g. after other lucide-react imports or custom components
  content = content.replace(
    "import { format, isSameDay, startOfWeek, endOfWeek, addDays, parseISO, isAfter } from 'date-fns';",
    "import { format, isSameDay, startOfWeek, endOfWeek, addDays, parseISO, isAfter } from 'date-fns';\nimport ExcelModule from './components/ExcelModule';"
  );
}

const targetLocation = `                {/* Over sectie */}`;
const moduleRender = `                <ExcelModule activeClub={activeClub} currentUser={currentUser} data={data} setData={setData} />
                
                {/* Over sectie */}`;

if (content.includes(targetLocation) && !content.includes('<ExcelModule')) {
  content = content.replace(targetLocation, moduleRender);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Patched App.tsx successfully.");
} else {
  console.log("Could not find target location or already patched.");
}
