const escapeIcs = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const formatIcsDate = (date) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

const calendarAdapters = Object.freeze({
  google: { enabled: false, name: "Google Calendar" },
  outlook: { enabled: false, name: "Outlook Calendar" },
  ics: { enabled: true, name: "ICS Export" },
});

const createIcs = (interview) => {
  const start = new Date(interview.scheduledAt);
  const end = new Date(start.getTime() + Number(interview.duration || 60) * 60000);
  const location = interview.meetingLink || interview.location || interview.mode;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpportunityX//Interview Management//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:interview-${interview._id}@opportunityx`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(interview.title)}`,
    `DESCRIPTION:${escapeIcs(interview.description || "OpportunityX interview")}`,
    `LOCATION:${escapeIcs(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

const importIcs = () => {
  throw new Error("ICS import adapter is not enabled yet");
};

module.exports = {
  calendarAdapters,
  createIcs,
  importIcs,
};
