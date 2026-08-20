const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

const boardMsg = `
export interface BoardMessageReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface BoardMessage {
  id: string;
  title: string;
  content: string;
  attachment?: {
    name: string;
    type: string;
    dataUrl: string;
  };
  authorId: string;
  targetClubId?: string;
  targetRoles?: ('applicatiebeheerder' | 'admin' | 'planner' | 'member')[];
  createdAt: string;
  readBy: string[];
  keptOnHomeBy: string[];
  archivedBy: string[];
  deletedBy: string[];
  replies: BoardMessageReply[];
}
`;

if (!code.includes('BoardMessage')) {
  code += boardMsg;
  fs.writeFileSync('src/types.ts', code);
  console.log('patched types');
}
