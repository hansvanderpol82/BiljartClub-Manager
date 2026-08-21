const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const old_thead = `<thead className="hidden sm:table-header-group">
<tr className="bg-[#163a16] text-[#f1c40f] text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b]">
                                          <th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">
                                            Speler (Wit)
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Inleg"
                                          >
                                            Inleg
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Aanwezig"
                                          >
                                            Aanw.
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">
                                            HS
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Te maken"
                                          >
                                            Te maken
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                      Car.
                                    </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                            title="Punten (Wit)"
                                          >
                                            Pnt.
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                            title="Punten (Geel)"
                                          >
                                            Pnt.
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                      Car.
                                    </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Te maken"
                                          >
                                            Te maken
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">
                                            HS
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Aanwezig"
                                          >
                                            Aanw.
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Inleg"
                                          >
                                            Inleg
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 sm:px-4 text-right border-r border-[#2b6e2b]/30">
                                            Speler (Geel)
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 sm:px-4 text-center exclude-from-share">
                                            Actie
                                          </th>
                                        </tr>
                                      </thead>`;

const new_thead = `<thead className="">
<tr className="bg-[#163a16] text-[#f1c40f] text-[9px] sm:text-xs font-black uppercase tracking-widest border-b border-[#2b6e2b] grid grid-cols-[1fr_auto_auto_auto_auto] sm:table-row">
                                          <th className="py-2 sm:py-4 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30">
                                            <span className="sm:hidden">Speler</span><span className="hidden sm:inline">Speler (Wit)</span>
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Inleg"
                                          >
                                            Inleg
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Aanwezig"
                                          >
                                            Aanw.
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">
                                            HS
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Te maken"
                                          >
                                            <span className="sm:hidden">TM</span><span className="hidden sm:inline">Te maken</span>
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                            <span className="sm:hidden">Car.</span><span className="hidden sm:inline">Car.</span>
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                            title="Punten (Wit)"
                                          >
                                            <span className="sm:hidden">Pnt.</span><span className="hidden sm:inline">Pnt.</span>
                                          </th>
                                          <th
                                            className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 bg-black/20"
                                            title="Punten (Geel)"
                                          >
                                            Pnt.
                                          </th>
                                          <th className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 w-[72px] sm:w-[88px]">
                                            Car.
                                          </th>
                                          <th
                                            className="hidden sm:table-cell py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30"
                                            title="Te maken"
                                          >
                                            Te maken
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell" title="Hoogste Serie">
                                            HS
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Aanwezig"
                                          >
                                            Aanw.
                                          </th>
                                          <th
                                            className="py-2 sm:py-4 px-2 text-center border-r border-[#2b6e2b]/30 hidden sm:table-cell"
                                            title="Inleg"
                                          >
                                            Inleg
                                          </th>
                                          <th className="hidden sm:table-cell py-2 sm:py-4 px-2 sm:px-4 text-right border-r border-[#2b6e2b]/30">
                                            Speler (Geel)
                                          </th>
                                          <th className="py-2 sm:py-4 px-2 sm:px-4 text-center exclude-from-share">
                                            <span className="sm:hidden">Actie</span><span className="hidden sm:inline">Actie</span>
                                          </th>
                                        </tr>
                                      </thead>`;

if (content.includes(old_thead)) {
  content = content.replace(old_thead, new_thead);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Successfully replaced internal matches thead.");
} else {
  console.log("Could not find the target string. Looking for partial match...");
  const searchStart = '<thead className="hidden sm:table-header-group">\n<tr className="bg-[#163a16] text-[#f1c40f] text-[10px]';
  if (content.includes(searchStart)) {
      console.log("Found start");
  }
}
