const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const tableBlockStart = content.indexOf('className="w-full border-collapse"', content.indexOf('ref={standingsRef}'));

if (tableBlockStart !== -1) {
  let theadStart = content.indexOf('<thead', tableBlockStart);
  let theadEnd = content.indexOf('</thead>', theadStart) + 8;
  
  let theadContent = content.substring(theadStart, theadEnd);
  
  // Remove the hidden sm:table-header-group
  theadContent = theadContent.replace('className="hidden sm:table-header-group"', '');
  
  // Make the font even smaller on mobile if needed (text-[9px])
  theadContent = theadContent.replace('text-[10px] sm:text-xs', 'text-[9px] sm:text-xs');
  
  // Replace text labels
  theadContent = theadContent.replace(
    /\s+Positie\s+/,
    '\n                                          <span className="sm:hidden">#</span><span className="hidden sm:inline">Positie</span>\n                                        '
  );
  
  theadContent = theadContent.replace(
    /Caramboles\{" "\}/,
    '<span className="sm:hidden">Car.</span><span className="hidden sm:inline">Caramboles</span>{" "}'
  );
  
  theadContent = theadContent.replace(
    /Wedstrijden\{" "\}/,
    '<span className="sm:hidden">Gesp.</span><span className="hidden sm:inline">Wedstrijden</span>{" "}'
  );
  
  theadContent = theadContent.replace(
    /Hoogste serie\{" "\}/,
    '<span className="sm:hidden">Hs.</span><span className="hidden sm:inline">Hoogste serie</span>{" "}'
  );
  
  theadContent = theadContent.replace(
    /Punten\{" "\}/,
    '<span className="sm:hidden">Pnt.</span><span className="hidden sm:inline">Punten</span>{" "}'
  );
  
  theadContent = theadContent.replace(
    /Gemiddelde\{" "\}/,
    '<span className="sm:hidden">Gem.</span><span className="hidden sm:inline">Gemiddelde</span>{" "}'
  );

  content = content.substring(0, theadStart) + theadContent + content.substring(theadEnd);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Headers updated successfully!");
} else {
  console.log("Could not find table block.");
}
