const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const theadSearch = `<th className="pb-2 font-medium w-8">#</th>
                            <th className="pb-2 font-medium">Naam</th>
                            <th className="pb-2 font-medium text-right">Pnt</th>
                            <th className="pb-2 font-medium text-right">Gem</th>`;
const theadReplace = `<th className="pb-2 font-medium w-8 pl-4 sm:pl-0">#</th>
                            <th className="pb-2 font-medium">Naam</th>
                            <th className="pb-2 font-medium text-right">Pnt</th>
                            <th className="pb-2 font-medium text-right pr-4 sm:pr-0">Gem</th>`;

content = content.replace(theadSearch, theadReplace);

const td1Search = '<td className="py-1 sm:py-2.5 text-slate-400 font-bold">{idx + 1}</td>';
const td1Replace = '<td className="py-1 sm:py-2.5 text-slate-400 font-bold pl-4 sm:pl-0">{idx + 1}</td>';
content = content.replace(td1Search, td1Replace);

const td2Search = '<td className="py-1 sm:py-2.5 text-right text-slate-500">{formatDecimal(stat.currentAvg, 3)}</td>';
const td2Replace = '<td className="py-1 sm:py-2.5 text-right text-slate-500 pr-4 sm:pr-0">{formatDecimal(stat.currentAvg, 3)}</td>';
content = content.replace(td2Search, td2Replace);

const td3Search = '<td className="py-1 sm:py-2.5 text-slate-400 font-bold">{userStandingIndex + 1}</td>';
const td3Replace = '<td className="py-1 sm:py-2.5 text-slate-400 font-bold pl-4 sm:pl-0">{userStandingIndex + 1}</td>';
content = content.replace(td3Search, td3Replace);

const td4Search = '<td className="py-1 sm:py-2.5 text-right text-slate-500">\n                                  {formatDecimal(standings[userStandingIndex].currentAvg, 3)}\n                                </td>';
const td4Replace = '<td className="py-1 sm:py-2.5 text-right text-slate-500 pr-4 sm:pr-0">\n                                  {formatDecimal(standings[userStandingIndex].currentAvg, 3)}\n                                </td>';
content = content.replace(td4Search, td4Replace);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated HomeTab table padding");
