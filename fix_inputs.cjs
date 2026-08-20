const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const clubTarget = `                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setLogoError("");
                        
                        if (file.size > 5 * 1024 * 1024) {
                          setLogoError("Bestand is te groot (max 5MB).");
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
                            setNewClubLogo(base64String);
                          } else {
                            setLogoError("Fout bij het verwerken van de afbeelding.");
                          }
                          URL.revokeObjectURL(objectUrl);
                        };
                        img.onerror = () => {
                          setLogoError("Fout bij het lezen van de afbeelding.");
                          URL.revokeObjectURL(objectUrl);
                        };
                        img.src = objectUrl;
                      }}`;

const clubReplacement = `                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setLogoError("");
                        
                        if (file.size > 5 * 1024 * 1024) {
                          setLogoError("Bestand is te groot (max 5MB).");
                          e.target.value = '';
                          return;
                        }
                        const objectUrl = URL.createObjectURL(file);
                        setCropperConfig({ isOpen: true, imageSrc: objectUrl, target: "club" });
                        e.target.value = '';
                      }}`;

const avatarTarget = `                            onChange={(e) => {
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
                            }}`;

const avatarReplacement = `                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Bestand is te groot (max 5MB).");
                                e.target.value = '';
                                return;
                              }
                              const objectUrl = URL.createObjectURL(file);
                              setCropperConfig({ isOpen: true, imageSrc: objectUrl, target: "avatar" });
                              e.target.value = '';
                            }}`;

code = code.replace(clubTarget, clubReplacement);
code = code.replace(avatarTarget, avatarReplacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
