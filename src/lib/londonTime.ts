/**
 * Europe/London clock helpers for the Friday 10am timesheet send.
 * Cron itself is UTC; BST/GMT would drift to 11am or 9am if we scheduled
 * a single UTC hour. Callers must gate on this, not on UTC hour.
 */
export function londonParts(date: Date): {
  weekday: string;
  hour: number;
  minute: number;
  timeZoneName: string;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    weekday: read("weekday"),
    hour: Number(read("hour")),
    minute: Number(read("minute")),
    timeZoneName: read("timeZoneName"),
  };
}

/** True during Friday 10:00–10:59 Europe/London (GMT or BST). */
export function isLondonFridayTenAmWindow(date: Date): boolean {
  const parts = londonParts(date);
  return parts.weekday === "Fri" && parts.hour === 10;
}
