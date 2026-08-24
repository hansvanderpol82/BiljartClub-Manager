const slots = [
  { match: "q7idl4q2y", car: 0, hs: 0 },
  { match: "6u4n1y1bc", car: 8, hs: 3 },
  { match: "5twwhf0qw", car: 8, hs: 2 },
  { match: "5vtnje1qg", car: 6, hs: 3 },
  { match: "co38es6pi", car: 8, hs: 3 },
  { match: "co38es6pi", car: 8, hs: 3 },
  { match: "eyj0ngpbt", car: 5, hs: 2 },
  { match: "ujiwnbhz6", car: 5, hs: 1 },
  { match: "vp28ao3aq", car: 5, hs: 2 },
  { match: "a7gymejyj", car: 8, hs: 2 },
  { match: "9k3yyzn91", car: 5, hs: 1 },
  { match: "6aize54i3", car: 6, hs: 4 },
  { match: "mj2j9bsh6", car: 5, hs: 1 },
  { match: "apkh5xu8k", car: 1, hs: 1 },
  { match: "ohrlktz87", car: 5, hs: 2 },
  { match: "13bbaly9u", car: 7, hs: 2 },
  { match: "s9wk8inen", car: 3, hs: 1 },
  { match: "s9wk8inen", car: 5, hs: 2 }
];

let best = null;

function search(index, adCount, joCount, adCar, joCar, adHS, joHS, partition) {
    if (best) return;
    if (index === slots.length) {
        if (adCount === 9 && joCount === 9 && adCar === 51 && joCar === 47 && adHS === 3 && joHS === 4) {
            best = [...partition];
        }
        return;
    }
    
    // pruning
    if (adCount > 9 || joCount > 9) return;
    if (adCar > 51 || joCar > 47) return;
    
    const slot = slots[index];
    const partnerIdx = slots.findIndex((s, i) => i < index && s.match === slot.match);
    
    // Try Ad
    if (partnerIdx === -1 || partition[partnerIdx] !== 'Ad') {
        let nHS = Math.max(adHS, slot.hs);
        if (nHS <= 3) {
            partition.push('Ad');
            search(index+1, adCount+1, joCount, adCar+slot.car, joCar, nHS, joHS, partition);
            partition.pop();
        }
    }
    // Try Jo
    if (partnerIdx === -1 || partition[partnerIdx] !== 'Jo') {
        let nHS = Math.max(joHS, slot.hs);
        if (nHS <= 4) {
            partition.push('Jo');
            search(index+1, adCount, joCount+1, adCar, joCar+slot.car, adHS, nHS, partition);
            partition.pop();
        }
    }
}
search(0, 0, 0, 0, 0, 0, 0, []);
console.log("Best:", best);
