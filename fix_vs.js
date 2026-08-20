const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix 1: <span>VS</span> -> <span>-</span>
content = content.replace(/<span>VS<\/span>/g, '<span>-</span>');

// Fix 2: <th className="p-3 font-bold w-10 text-center">\n                                  VS\n                                <\/th>
content = content.replace(/<th className="p-3 font-bold w-10 text-center">\s*VS\s*<\/th>/g, '<th className="p-3 font-bold w-10 text-center">\n                                  -\n                                </th>');

// Fix 3: <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">\n                                        VS\n                                      <\/span>
content = content.replace(/<span className="text-\[10px\] font-black text-slate-400 uppercase tracking-widest">\s*VS\s*<\/span>/g, '<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">\n                                        -\n                                      </span>');

// Fix 4: vs{" "} -> -{" "}
content = content.replace(/} vs\{" "\}/g, '} -{" "}');

fs.writeFileSync('src/App.tsx', content);
console.log('done');
