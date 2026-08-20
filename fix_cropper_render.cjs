const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `      {/* Payment Modal */}`;

const replacement = `      <ImageCropperModal
        isOpen={cropperConfig.isOpen}
        imageSrc={cropperConfig.imageSrc}
        onClose={() => setCropperConfig({ isOpen: false, imageSrc: "", target: null })}
        onCropComplete={(croppedBase64) => {
          if (cropperConfig.target === "club") {
            setNewClubLogo(croppedBase64);
          } else if (cropperConfig.target === "avatar") {
            setUserSettingsAvatar(croppedBase64);
          }
        }}
      />

      {/* Payment Modal */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('done');
