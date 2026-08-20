const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The easiest way is to render a completely different view for mobile.
// Wait, I can just change the class of the table to `hidden lg:table`
// and insert a mobile view next to it.
// Let's do this for `extMatch` and `match` rows?

// Or, we can use CSS Grid inside the `tr`!
// If we set the table to `block`, `tbody` to `block`, `tr` to `grid grid-cols-3` or something.
// But HTML tables don't always play nice with flex/grid.

// Let's create a script that modifies the `td` elements of the external match table to allow them to wrap or stack.
