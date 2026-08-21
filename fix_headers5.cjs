const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = '<thead className="hidden sm:table-header-group"><tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">';
let currentIndex = 0;

while (true) {
  const startIndex = content.indexOf(searchStr, currentIndex);
  if (startIndex === -1) break;
  
  const endIndex = content.indexOf('</thead>', startIndex);
  let thead = content.substring(startIndex, endIndex);

  // Replace "Car." width
  thead = thead.replace(
    /<th className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30">\s*Car\.\s*<\/th>/g,
    '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">\n                                      Car.\n                                    </th>'
  );

  // Replace "Pnt." width
  thead = thead.replace(
    /<th\s*className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30 bg-black\/20"\s*title="Punten \((Thuis|Uit)\)"\s*>\s*Pnt\.\s*<\/th>/g,
    '<th\n                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"\n                                      title="Punten ($1)"\n                                    >\n                                      Pnt.\n                                    </th>'
  );

  content = content.substring(0, startIndex) + thead + content.substring(endIndex);
  currentIndex = startIndex + thead.length;
}

fs.writeFileSync('src/App.tsx', content);
console.log("Headers replaced!");
