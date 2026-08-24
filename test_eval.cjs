const assignment = ['Ad', 'Ad', 'Ad', 'Ad', 'Ad', 'Jo', 'Ad', 'Ad', 'Jo', 'Ad', 'Jo', 'Jo', 'Jo', 'Jo', 'Jo', 'Jo', 'Ad', 'Jo'];
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

let adCar = 0; let joCar = 0;
let adHS = 0; let joHS = 0;
assignment.forEach((p, i) => {
    if (p === 'Ad') {
        adCar += slots[i].car;
        if (slots[i].hs > adHS) adHS = slots[i].hs;
    } else {
        joCar += slots[i].car;
        if (slots[i].hs > joHS) joHS = slots[i].hs;
    }
});

console.log(`Ad: ${adCar} (HS ${adHS}), Jo: ${joCar} (HS ${joHS})`);
