const fs = require('fs');
let code = fs.readFileSync('src/components/BoardMessageCard.tsx', 'utf-8');
const target = `              {message.attachment && (
                <div className="inline-flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  {message.attachment.type.startsWith('image/') ? (
                    <img src={message.attachment.dataUrl} alt={message.attachment.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Paperclip size={24} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white truncate">{message.attachment.name}</p>
                    <a 
                      href={message.attachment.dataUrl} 
                      download={message.attachment.name}
                      className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={14} /> Downloaden
                    </a>
                  </div>
                </div>
              )}`;
const replacement = `              {message.attachment && (
                <a 
                  href={message.attachment.dataUrl} 
                  download={message.attachment.name}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {message.attachment.type.startsWith('image/') ? (
                    <img src={message.attachment.dataUrl} alt={message.attachment.name} className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Paperclip size={24} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white truncate">{message.attachment.name}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      <Download size={14} /> Downloaden
                    </span>
                  </div>
                </a>
              )}`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/BoardMessageCard.tsx', code);
console.log('done');
