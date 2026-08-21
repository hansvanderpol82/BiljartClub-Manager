const fs = require('fs');
let block = fs.readFileSync('tr2_block.txt', 'utf-8');

// Replace the <tr ...>
const newTrStart = `<tr
                                            key={mappedMatch.id}
                                            onClick={() => {
                                              if (isFinished || isStarted) {
                                                setLiveMatchId(match.id);
                                              } else if (!isFinished && !isStarted && (isClubAdmin(activeClub, currentUser) || currentUser.role === "admin" || currentUser.role === "planner" || currentUser.role === "user")) {
                                                setMatchToStartId(match.id);
                                                setIsStartMatchModalOpen(true);
                                              }
                                            }}
                                            className={cn("transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_72px_72px] sm:table-row", (isFinished || isStarted || (!isFinished && !isStarted && (isClubAdmin(activeClub, currentUser) || currentUser.role === "admin" || currentUser.role === "planner" || currentUser.role === "user"))) ? "cursor-pointer hover:bg-white/10" : "hover:bg-white/5")}
                                          >`;

block = block.replace(
  /<tr\s+key=\{mappedMatch\.id\}\s+className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0 grid grid-cols-\[1fr_auto_auto_auto_auto\] sm:table-row"\s*>/,
  newTrStart
);

let tds = [];
let currentIndex = 0;
while (true) {
  const start = block.indexOf('<td', currentIndex);
  if (start === -1) break;
  const end = block.indexOf('</td>', start) + 5;
  tds.push({ start, end, content: block.slice(start, end) });
  currentIndex = end;
}

if (tds.length === 13) {
  const addClass = (html, cls) => html.replace(/<td className="/, `<td className="${cls} `);
  
  // Clean up existing placement classes
  const cleanClasses = (html) => html.replace(/ col-start-\d row-start-\d( sm:col-auto sm:row-auto)?/g, '');

  tds[0].newContent = addClass(cleanClasses(tds[0].content), 'col-start-1 row-start-1 sm:col-auto sm:row-auto');
  tds[4].newContent = addClass(cleanClasses(tds[4].content), 'col-start-2 row-start-1 sm:col-auto sm:row-auto');
  tds[5].newContent = addClass(cleanClasses(tds[5].content), 'col-start-3 row-start-1 sm:col-auto sm:row-auto');
  tds[6].newContent = addClass(cleanClasses(tds[6].content), 'col-start-3 row-start-2 sm:col-auto sm:row-auto');
  tds[7].newContent = addClass(cleanClasses(tds[7].content), 'col-start-2 row-start-2 sm:col-auto sm:row-auto');
  
  // For TD 11
  let td11Content = cleanClasses(tds[11].content);
  td11Content = td11Content.replace('text-left sm:text-right', 'text-left');
  td11Content = addClass(td11Content, 'col-start-1 row-start-2 sm:col-auto sm:row-auto');
  
  // swap structure
  // Current structure inside TD 11:
  // <div flex items-center justify-end>
  //   <span ... mr-2> ... </span>
  //   <p ...> ... </p>
  // </div>
  td11Content = td11Content.replace('justify-end', '');
  td11Content = td11Content.replace('inline-block mr-2"', 'inline-block"'); // remove mr-2 from span
  td11Content = td11Content.replace('inline-block"', 'inline-block mr-2"'); // add mr-2 to p
  
  // Extract span and p
  const spanStart = td11Content.indexOf('<span');
  const spanEnd = td11Content.indexOf('</span>') + 7;
  const pStart = td11Content.indexOf('<p');
  const pEnd = td11Content.indexOf('</p>') + 4;
  
  const spanStr = td11Content.slice(spanStart, spanEnd);
  const pStr = td11Content.slice(pStart, pEnd);
  
  // reconstruct the div interior
  // note that there's whitespace between span and p, we'll just replace the whole chunk from spanStart to pEnd
  const beforeElements = td11Content.slice(0, spanStart);
  const afterElements = td11Content.slice(pEnd);
  
  td11Content = beforeElements + pStr + '                                                ' + spanStr + afterElements;

  tds[11].newContent = td11Content;

  // Remove td[12] completely
  tds[12].newContent = '';

  for (let i = 12; i >= 0; i--) {
    if (tds[i].newContent !== undefined) {
      block = block.slice(0, tds[i].start) + tds[i].newContent + block.slice(tds[i].end);
    }
  }
} else {
  console.log("Error: not 13 tds! Found " + tds.length);
}

fs.writeFileSync('tr2_block_fixed.txt', block);
