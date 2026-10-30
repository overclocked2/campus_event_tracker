export let allEvents = [];

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isPast(event) {
  return new Date(event.date) < startOfToday();
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

export async function fetchEvents() {
  const res = await fetch("events.json");
  if (!res.ok) throw new Error("HTTP " + res.status);
  allEvents = await res.json();
  return allEvents;
}