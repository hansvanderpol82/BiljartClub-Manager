const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                                  {formatCurrency(totalBalance)}
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
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">`;

const replace = `                                  {formatCurrency(totalBalance)}
                                </p>
                              </div>
                              <div className="text-slate-400">
                                {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
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
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">`;
content = content.replace(target, replace);
fs.writeFileSync('src/App.tsx', content);
