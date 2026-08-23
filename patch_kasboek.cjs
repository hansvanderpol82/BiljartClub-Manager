const fs = require('fs');
let content = fs.readFileSync('bad_kasboek.tsx', 'utf-8');

content = content.replace(
  /\{formatCurrency\(totalBalance\)\}\s*<\/p>\s*<\/div>\s*<\/div>\s*<div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">/,
  `{formatCurrency(totalBalance)}
                                </p>
                              </div>
                              <div className="text-slate-400">
                                {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                              </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">`
);

fs.writeFileSync('fixed_kasboek.tsx', content);
