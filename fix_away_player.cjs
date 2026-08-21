const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `<td className="py-1 sm:py-2 px-2 sm:px-4 text-left sm:text-right border-r border-[#2b6e2b]/30 col-start-1 row-start-2">
                                                  <div className="flex items-center justify-end">
                                                    <span className="text-[12px] text-emerald-300 font-bold tracking-widest inline-block mr-2 opacity-80">
                                                      (
                                                      {formatNumber(
                                                        game.awayTarget ??
                                                          p2?.baseAverage ??
                                                          0,
                                                      )}
                                                      )
                                                    </span>
                                                    <p
                                                      className="font-bold text-white truncate text-base inline-block"
                                                      title={
                                                        p2?.name || "Onbekend"
                                                      }
                                                    >
                                                      {p2?.shortName ||
                                                        p2?.name ||
                                                        "Onbekend"}
                                                    </p>
                                                  </div>
                                                </td>`;

const replacement = `<td className="py-1 sm:py-2 px-2 sm:px-4 text-left border-r border-[#2b6e2b]/30 col-start-1 row-start-2">
                                                  <div className="flex items-center">
                                                    <p
                                                      className="font-bold text-white truncate text-base inline-block mr-2"
                                                      title={
                                                        p2?.name || "Onbekend"
                                                      }
                                                    >
                                                      {p2?.shortName ||
                                                        p2?.name ||
                                                        "Onbekend"}
                                                    </p>
                                                    <span className="text-[12px] text-emerald-300 font-bold tracking-widest inline-block opacity-80">
                                                      (
                                                      {formatNumber(
                                                        awayTargetForCalc,
                                                      )}
                                                      )
                                                    </span>
                                                  </div>
                                                </td>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully replaced away player layout.');
} else {
  console.log('Target string not found.');
}
