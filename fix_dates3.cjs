const message1 = "Hans van der Pol jr. heeft zich afgemeld voor speeldag: 2026-08-23T22:00:00.000Z.";
const formatNotificationMessage = (message) => {
  if (message.includes("heeft zich afgemeld voor speeldag:")) {
    const parts = message.split("heeft zich afgemeld voor speeldag: ");
    if (parts.length === 2) {
      const datePart = parts[1].replace(/\.$/, "").trim();
      try {
        const dateObj = new Date(datePart);
        if (!isNaN(dateObj.getTime())) {
          return `${parts[0]}heeft zich afgemeld voor ${dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return message;
};
console.log(formatNotificationMessage(message1));
