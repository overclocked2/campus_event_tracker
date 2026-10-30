import { db, auth } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { isPast, formatDate } from "./eventsService.js";

let updatesByEvent = {};

export function setUpdates(newUpdates) {
  updatesByEvent = newUpdates;
}

export function renderUpdates() {
  document.querySelectorAll(".updates").forEach((box) => {
    const list = updatesByEvent[box.dataset.eventId] || [];
    box.replaceChildren();
    if (list.length === 0) {
      const p = document.createElement("p");
      p.className = "no-updates";
      p.textContent = "No updates yet. Be the first!";
      box.appendChild(p);
      return;
    }
    list.forEach((u) => {
      const p = document.createElement("p");
      p.className = "update";
      p.textContent = (u.userName || "Someone") + ": " + u.message;
      box.appendChild(p);
    });
  });
}

export function makeCard(event) {
  const card = document.createElement("article");
  card.className = "card" + (isPast(event) ? " past" : "");

  const title = document.createElement("h2");
  title.textContent = event.title;

  const date = document.createElement("p");
  date.className = "date";
  date.textContent = formatDate(event.date) + (isPast(event) ? " (past)" : "");

  const venue = document.createElement("p");
  venue.className = "venue";
  venue.textContent = event.venue;

  const tags = document.createElement("div");
  tags.className = "tags";
  const cat = document.createElement("span");
  cat.className = "tag";
  cat.textContent = event.category;
  tags.appendChild(cat);
  if (event.swags) {
    const s = document.createElement("span");
    s.className = "tag swag";
    s.textContent = "Swags";
    tags.appendChild(s);
  }

  card.append(title, date, venue, tags);

  if (event.link && event.link !== "#") {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = event.link;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "View details";
    card.appendChild(a);
  }

  const updates = document.createElement("div");
  updates.className = "updates";
  updates.dataset.eventId = event.id;

  const inputWrap = document.createElement("div");
  inputWrap.className = "update-input-wrap";

  const input = document.createElement("input");
  input.className = "msg auth-input";
  input.maxLength = 200;
  input.placeholder = "Share a live update...";

  const post = document.createElement("button");
  post.className = "post-btn";
  post.textContent = "Post";
  
  post.onclick = async () => {
    const text = input.value.trim();
    if (!text || !auth.currentUser || !db) return;
    try {
      await addDoc(collection(db, "updates"), {
        eventId: event.id,
        message: text,
        uid: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: serverTimestamp()
      });
      input.value = "";
    } catch (err) {
      console.error(err);
      alert("Could not post update. Check the console.");
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") post.click();
  });

  inputWrap.append(input, post);
  card.append(updates, inputWrap);
  return card;
}