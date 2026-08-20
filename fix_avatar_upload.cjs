const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    {userSettingsAvatar ? (
                      <img
                        src={userSettingsAvatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-slate-100 dark:border-slate-800">
                        <UserCircle size={48} />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        showPrompt(
                          "Avatar URL",
                          "Voer de URL van je avatar in:",
                          userSettingsAvatar,
                          (url) => setUserSettingsAvatar(url),
                        );
                      }}
                      className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>
                </div>`;

const replacement = `                <div className="flex flex-col items-center justify-center mb-4 space-y-2">
                  <div className="relative group">
                    {userSettingsAvatar ? (
                      <div className="relative">
                        <img
                          src={userSettingsAvatar}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => setUserSettingsAvatar("")}
                          className="absolute bottom-0 right-0 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                          title="Avatar verwijderen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-slate-100 dark:border-slate-800">
                          <UserCircle size={48} />
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors cursor-pointer" title="Avatar uploaden">
                          <ImageIcon size={16} />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Bestand is te groot (max 5MB).");
                                e.target.value = '';
                                return;
                              }
                              const img = new Image();
                              const objectUrl = URL.createObjectURL(file);
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                let width = img.width;
                                let height = img.height;
                                const MAX_DIMENSION = 400;
                                if (width > height && width > MAX_DIMENSION) {
                                  height *= MAX_DIMENSION / width;
                                  width = MAX_DIMENSION;
                                } else if (height > MAX_DIMENSION) {
                                  width *= MAX_DIMENSION / height;
                                  height = MAX_DIMENSION;
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const base64String = canvas.toDataURL("image/jpeg", 0.8);
                                  setUserSettingsAvatar(base64String);
                                }
                                URL.revokeObjectURL(objectUrl);
                              };
                              img.onerror = () => {
                                alert("Fout bij het lezen van de afbeelding.");
                                URL.revokeObjectURL(objectUrl);
                              };
                              img.src = objectUrl;
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Max 5MB, JPG/PNG</p>
                </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
