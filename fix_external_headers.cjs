const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We have 2 tables to fix.
// Let's replace the whole thead strings exactly.

// --- TABLE 1 (App.tsx ~7210) ---
const t1_find = `<thead className="hidden sm:table-header-group">
                                      <tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                        <th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">
                                          Speler (Thuis)
                                        </th>
                                        <th
                                          className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                          title="Inleg (Thuis)"
                                        >
                                          Inleg
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Hoogste Serie
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Gemiddelde
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                          Caramboles
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]">
                                          Punten
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]">
                                          Punten
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                          Caramboles
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Gemiddelde
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Hoogste Serie
                                        </th>
                                        <th
                                          className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                          title="Inleg (Uit)"
                                        >
                                          Inleg
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 sm:px-4 text-right border-r border-[#2b6e2b]/30">
                                          Speler (Uit)
                                        </th>
                                        
                                      </tr>
                                    </thead>`;

const t1_repl = `<thead className="">
                                      <tr className="bg-[#163a16] text-[#f1c40f] text-[9px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b] grid grid-cols-[1fr_72px_72px] sm:table-row">
                                        <th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">
                                          <span className="sm:hidden">Speler</span><span className="hidden sm:inline">Speler (Thuis)</span>
                                        </th>
                                        <th
                                          className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                          title="Inleg (Thuis)"
                                        >
                                          Inleg
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Hoogste Serie
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Gemiddelde
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                          <span className="sm:hidden">Car.</span><span className="hidden sm:inline">Caramboles</span>
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]">
                                          <span className="sm:hidden">Pnt.</span><span className="hidden sm:inline">Punten</span>
                                        </th>
                                        <th className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]">
                                          Punten
                                        </th>
                                        <th className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                          Caramboles
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Gemiddelde
                                        </th>
                                        <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell">
                                          Hoogste Serie
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

content = content.replace(t1_find, t1_repl);


// --- TABLE 2 (App.tsx ~9546) ---
const t2_find = `<thead className="hidden sm:table-header-group">
                                  <tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                    <th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">
                                      Speler (Thuis)
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
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                      title="Gemiddelde"
                                    >
                                      Gem.
                                    </th>
                                    <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                      Car.
                                    </th>
                                    <th
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"
                                      title="Punten (Thuis)"
                                    >
                                      Pnt.
                                    </th>
                                    <th
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20 w-[72px] sm:w-[88px]"
                                      title="Punten (Uit)"
                                    >
                                      Pnt.
                                    </th>
                                    <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                      Car.
                                    </th>
                                    <th
                                      className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
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
                                    <th className="py-2 sm:py-4 px-2 sm:px-4 text-right border-r border-[#2b6e2b]/30">
                                      Speler (Uit)
                                    </th>
                                    
                                  </tr>
                                </thead>`;

const t2_repl = `<thead className="">
                                  <tr className="bg-[#163a16] text-[#f1c40f] text-[9px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b] grid grid-cols-[1fr_72px_72px] sm:table-row">
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

content = content.replace(t2_find, t2_repl);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
