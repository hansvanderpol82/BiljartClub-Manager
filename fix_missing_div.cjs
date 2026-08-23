const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                                  {formatCurrency(totalBalance)}
                                </p>
                              </div>
                              <div className="text-slate-400">
                                {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                              </div>
                            </div>
                            
                            <AnimatePresence>`;

const replace = `                                  {formatCurrency(totalBalance)}
                                </p>
                              </div>
                              <div className="text-slate-400">
                                {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                              </div>
                            </div>
                          </div>
                            
                            <AnimatePresence>`;

content = content.replace(target, replace);
fs.writeFileSync('src/App.tsx', content);
