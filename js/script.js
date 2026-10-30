import { db } from "./firebase.js";
import { allEvents, fetchEvents, isPast } from "./eventsService.js";
import { makeCard, setUpdates, renderUpdates } from "./cardComponent.js";
import { initAuth } from "./auth.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const eventsEl = $("events");
const countEl = $("count");
const searchEl = $("search");
const categoryEl = $("category");
const swagsEl = $("swags");
const hidePastEl = $("hidePast");

function listenToUpdates() {
  if (!db) return;
  const q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    const updatesByEvent = {};
    snap.docs.forEach((d) => {
      const u = d.data();
      (updatesByEvent[u.eventId] ||= []).push(u);
    });
    setUpdates(updatesByEvent);
    renderUpdates();
  }, (err) => {
    console.error("Firestore snapshot error:", err);
  });
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const cat = categoryEl.value;

  const list = allEvents
    .filter(e => (e.title + " " + e.venue).toLowerCase().includes(q))
    .filter(e => cat === "all" || e.category === cat)
    .filter(e => !swagsEl.checked || e.swags)
    .filter(e => !hidePastEl.checked || !isPast(e))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  eventsEl.replaceChildren();
  countEl.textContent = list.length + (list.length === 1 ? " event" : " events");

  if (list.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No events match. Clear a filter or search for something else.";
    eventsEl.appendChild(p);
    return;
  }
  list.forEach(e => eventsEl.appendChild(makeCard(e)));
  renderUpdates();
}

function fillCategories() {
  categoryEl.innerHTML = '<option value="all">All categories</option>';
  [...new Set(allEvents.map(e => e.category))].sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryEl.appendChild(opt);
  });
}

async function initApp() {
  try {
    await fetchEvents();
    fillCategories();
    render();
    listenToUpdates();
  } catch (err) {
    countEl.textContent = "Could not load events. Open the page with Live Server.";
    console.error(err);
  }
}

[searchEl, categoryEl, swagsEl, hidePastEl].forEach(el =>
  el.addEventListener("input", render)
);

// Initialize authentication and trigger app boot on login
initAuth(initApp);