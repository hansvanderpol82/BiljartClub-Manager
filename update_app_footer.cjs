const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetSettingsEnd = `                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation Bar */}`;

const replacementSettingsEnd = `                    </div>
                  </div>
                )}
                
                {activeTab === "settings" && (
                  <div className="mt-12 mb-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Ontwikkeld door <a href="https://hans-apps.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Hans-apps.com</a>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      in samenwerking met Google AI Studio
                    </p>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation Bar */}`;

appContent = appContent.replace(targetSettingsEnd, replacementSettingsEnd);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
