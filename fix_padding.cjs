const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// replace py-4 with py-2 sm:py-4 in th
content = content.replace(/<th([^>]*) className="([^"]*)py-4/g, '<th$1 className="$2py-2 sm:py-4');

// replace py-2 with py-1 sm:py-2 in td
content = content.replace(/<td([^>]*) className="([^"]*)py-2/g, '<td$1 className="$2py-1 sm:py-2');

// replace px-4 with px-2 sm:px-4
content = content.replace(/px-4/g, 'px-2 sm:px-4');

// replace pl-4 pr-4 with px-2 sm:px-4
content = content.replace(/pl-4 pr-4/g, 'px-2 sm:px-4');

fs.writeFileSync('src/App.tsx', content);
console.log('done padding fix');
