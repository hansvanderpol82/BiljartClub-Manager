const fs = require('fs');
let block = fs.readFileSync('tr2_block.txt', 'utf-8');

// 1. Update the opening <tr>
block = block.replace(
  /<tr\s+key=\{mappedMatch\.id\}\s+className="hover:bg-white\/5 transition-colors border-b border-\[#2b6e2b\]\/30 last:border-0 grid grid-cols-\[1fr_auto_auto_auto_auto\] sm:table-row"\s*>/,
  '<tr\n                                            key={mappedMatch.id}\n                                            onClick={() => {\n                                              if (isFinished) {\n                                                setSelectedExternalMatchId(extMatch.id);\n                                              } else if (!isStarted) {\n                                                // Maybe start match? Wait, external matches have toggleExternalMatchPayment? \n                                                // Actually the user said: "start the match, or open the details of the played match". \n                                              }\n                                            }}\n                                            className={cn("transition-colors border-b border-[#2b6e2b]/30 last:border-0 grid grid-cols-[1fr_72px_72px] sm:table-row", isFinished ? "cursor-pointer hover:bg-white/10" : "hover:bg-white/5")}>'
);

// We need to know what action the button did!
// Let's see what the Actie button did in tr2_block.txt.
