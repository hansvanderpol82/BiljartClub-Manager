const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [newMemberSendInvite, setNewMemberSendInvite] = useState(true);`;
const replacementState = `  const [newMemberSendInvite, setNewMemberSendInvite] = useState(true);
  const [newMemberActive, setNewMemberActive] = useState(true);`;

appContent = appContent.replace(targetState, replacementState);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
