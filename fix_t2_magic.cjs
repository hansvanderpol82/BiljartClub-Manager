const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find all thead elements and replace any that contains 'Speler (Thuis)' and 'hidden sm:table-header-group'
let index = 0;
while (true) {
  let start = content.indexOf('<thead className="hidden sm:table-header-group"', index);
  if (start === -1) break;
  let end = content.indexOf('</thead>', start) + 8;
  
  let block = content.substring(start, end);
  if (block.includes('Speler (Thuis)')) {
    // Found it!
    console.log("Found table 2!");
    
    let newBlock = `<thead className=""><tr className="bg-[#163a16] text-[#f1c40f] text-[9px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b] grid grid-cols-[1fr_72px_72px] sm:table-row">
                                    <th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">
                                      <span className="sm:hidden">Speler</span><span className="hidden sm:inline">Speler (Thuis)</span>
                                    </th>
                                    <th
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                      title="Inleg (Thuis)"
                                    >
                                      Inleg
                                    </th>
                                    <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">
                                      HS
                                    </th>
                                    <th
                                      className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Gemiddelde"
                                    >
                                      Gem.
                                    </th>
                                    <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                      <span className="sm:hidden">Car.</span><span className="hidden sm:inline">Car.</span>
                                    </th>
                                    <th
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"
                                      title="Punten (Thuis)"
                                    >
                                      <span className="sm:hidden">Pnt.</span><span className="hidden sm:inline">Pnt.</span>
                                    </th>
                                    <th
                                      className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"
                                      title="Punten (Uit)"
                                    >
                                      Pnt.
                                    </th>
                                    <th className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                      Car.
                                    </th>
                                    <th
                                      className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Gemiddelde"
                                    >
                                      Gem.
                                    </th>
                                    <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">
                                      HS
                                    </th>
                                    <th
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                      title="Inleg (Uit)"
                                    >
                                      Inleg
                                    </th>
                                    <th className="hidden sm:table-cell py-2 sm:py-4 px-2 sm:px-4 text-right border-r border-[#2b6e2b]/30">
                                      Speler (Uit)
                                    </th>
                                    
                                  </tr>
                                </thead>`;
    content = content.substring(0, start) + newBlock + content.substring(end);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Replaced!");
    break;
  }
  index = end;
}

