const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the start of the modal
const startString = `{isContributionsDetailModalOpen && activeSeason && (`;
const replaceStartString = `{isContributionsDetailModalOpen && (
          (() => {
            const detailSeason = data.seasons.find((s: Season) => s.id === contributionsDetailSeasonId) || activeSeason;
            if (!detailSeason) return null;
            return (`;

content = content.replace(startString, replaceStartString);

// We need to find the end of this block and close the IIFE.
// Actually, it's easier to just replace `activeSeason.` with `detailSeason.` inside the modal.
// Let's first extract the modal content, modify it, and put it back.
// Since the modal is large, let's find the boundaries.
// "isContributionsDetailModalOpen && activeSeason && ("
// is followed by a giant block.

// Alternative: Just replace `activeSeason.` with `(data.seasons.find((s: Season) => s.id === contributionsDetailSeasonId) || activeSeason).` inside the entire modal.
// But we need to make sure we only do it inside the modal.

