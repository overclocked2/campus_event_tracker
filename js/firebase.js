import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDT5uapD26U0620rIb3t32rLyphttyN5rU",
  authDomain: "hack-find-8a384.firebaseapp.com",
  projectId: "hack-find-8a384",
  storageBucket: "hack-find-8a384.firebasestorage.app",
  messagingSenderId: "618997234802",
  appId: "1:618997234802:web:7d2f81128f89ec1b0416eb",
  measurementId: "G-LHJV93Y7H8"
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;