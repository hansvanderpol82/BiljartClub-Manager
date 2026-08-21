const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startIndex = content.indexOf('<table className="w-full border-collapse">', 9000);
if (startIndex !== -1) {
  const endIndex = content.indexOf('</thead>', startIndex);
  let thead = content.substring(startIndex, endIndex);

  thead = thead.replaceAll(
    'className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"',
    'className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]"'
  );
  
  thead = thead.replaceAll(
    'className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"',
    'className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"'
  );

  content = content.substring(0, startIndex) + thead + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Headers replaced!");
} else {
  console.log("Not found.");
}
