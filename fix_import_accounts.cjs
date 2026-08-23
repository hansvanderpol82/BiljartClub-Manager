const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importTarget = `import { ImageCropperModal } from "./components/ImageCropperModal";`;
const importRep = `import { ImageCropperModal } from "./components/ImageCropperModal";
import { ManageAccountsTab } from "./components/ManageAccountsTab";`;

content = content.replace(importTarget, importRep);

const renderTarget = `            {activeTab === "manage" && currentUser.role === "applicatiebeheerder" && (`;
const renderRep = `            {activeTab === "manage-accounts" && currentUser.role === "applicatiebeheerder" && (
              <ManageAccountsTab data={data} setData={setData} currentUser={currentUser} />
            )}

            {activeTab === "manage" && currentUser.role === "applicatiebeheerder" && (`;

content = content.replace(renderTarget, renderRep);

fs.writeFileSync('src/App.tsx', content);
console.log("Imported and rendered ManageAccountsTab");
