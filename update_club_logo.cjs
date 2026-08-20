const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<input\s+type="file"\s+accept="image\/jpeg, image\/png, image\/webp"\s+onChange=\{\(e\) => \{[\s\S]*?\}\}\s+className="/g;

const replacement = `<input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={(e) => {
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
                      }}
                      className="`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', content);
console.log('done club logo input');
