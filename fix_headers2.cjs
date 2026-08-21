const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startIndex = content.indexOf('<table className="w-full border-collapse">', 9000);
if (startIndex !== -1) {
  const endIndex = content.indexOf('</thead>', startIndex);
  let thead = content.substring(startIndex, endIndex);

  thead = thead.replace(
    /<th className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30">\s*Car\.\s*<\/th>/g,
    '<th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">\n                                      Car.\n                                    </th>'
  );

  thead = thead.replace(
    /<th\s*className="py-2 sm:py-4 px-2 text-center border-r border-\[#2b6e2b\]\/30 bg-black\/20"\s*title="Punten \((Thuis|Uit)\)"\s*>\s*Pnt\.\s*<\/th>/g,
    '<th\n                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"\n                                      title="Punten ($1)"\n                                    >\n                                      Pnt.\n                                    </th>'
  );

  content = content.substring(0, startIndex) + thead + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Headers updated.");
} else {
  console.log("Table not found!");
}
