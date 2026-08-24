const message1 = "Hans van der Pol jr. heeft zich afgemeld voor speeldag: 2026-08-23T22:00:00.000Z.";
const parts = message1.split("heeft zich afgemeld voor speeldag: ");
const datePart = parts[1].replace(".", "").trim();
console.log("datePart:", datePart);
const dateObj = new Date(datePart);
console.log("dateObj:", dateObj);
console.log("isValid:", !isNaN(dateObj.getTime()));
console.log("formatted:", dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
