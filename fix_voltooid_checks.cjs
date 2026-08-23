const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Header Badge
const targetBadge = `                                  {season.status === 'closed' && (
                                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded-full tracking-widest">
                                      Voltooid
                                    </span>
                                  )}`;
const replaceBadge = `                                  {(season.isBlocked || season.status === 'closed') && (
                                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded-full tracking-widest">
                                      Voltooid
                                    </span>
                                  )}`;
content = content.replace(targetBadge, replaceBadge);

// Add button
const targetAdd = `                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    In- en Uitgaven
                                  </h4>
                                  {season.status !== 'closed' && (
                                    <button
                                      onClick={() => {`;
const replaceAdd = `                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    In- en Uitgaven
                                  </h4>
                                  {(!season.isBlocked && season.status !== 'closed') && (
                                    <button
                                      onClick={() => {`;
content = content.replace(targetAdd, replaceAdd);

// Edit/Delete buttons
const targetEditDel = `                                          <td className="py-1 sm:py-2 text-right">
                                            {season.status !== 'closed' && (
                                              <div className="flex justify-end gap-1">
                                                <button
                                                  onClick={() => {`;
const replaceEditDel = `                                          <td className="py-1 sm:py-2 text-right">
                                            {(!season.isBlocked && season.status !== 'closed') && (
                                              <div className="flex justify-end gap-1">
                                                <button
                                                  onClick={() => {`;
content = content.replace(targetEditDel, replaceEditDel);

fs.writeFileSync('src/App.tsx', content);
