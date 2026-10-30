import { auth, db, firebaseConfigured } from "./firebase.js";
import { 
  signInWithPopup, GoogleAuthProvider, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

export function initAuth(onUserLoggedIn) {
  if (!firebaseConfigured) {
    const errEl = $("signin-error");
    if (errEl) errEl.textContent = "Add your Firebase web app config in firebase.js to enable sign-in.";
    return;
  }

  const signinView = $("signin-view");
  const registerView = $("register-view");
  const gotoRegisterBtn = $("goto-register-btn");
  const gotoSigninBtn = $("goto-signin-btn");
  const googleBtn = $("google-btn");
  const loginForm = $("login-form");
  const registerForm = $("register-form");
  const logoutBtn = $("logout-btn");

  if (gotoRegisterBtn) {
    gotoRegisterBtn.onclick = (e) => {
      e.preventDefault();
      if (signinView) signinView.style.display = "none";
      if (registerView) registerView.style.display = "block";
      const errEl = $("signin-error");
      if (errEl) errEl.textContent = "";
    };
  }

  if (gotoSigninBtn) {
    gotoSigninBtn.onclick = (e) => {
      e.preventDefault();
      if (registerView) registerView.style.display = "none";
      if (signinView) signinView.style.display = "block";
      const errEl = $("register-error");
      if (errEl) errEl.textContent = "";
    };
  }

  if (googleBtn) {
    googleBtn.onclick = () =>
      signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => {
        const errEl = $("signin-error");
        if (errEl) errEl.textContent = e.message.replace("Firebase: ", "");
      });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = $("signin-error");
      if (errEl) errEl.textContent = "";
      const email = $("signin-email").value.trim();
      const password = $("signin-password").value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        if (errEl) errEl.textContent = err.message.replace("Firebase: ", "");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = $("register-error");
      if (errEl) errEl.textContent = "";
      const fullName = $("reg-fullname").value.trim();
      const email = $("reg-email").value.trim();
      const password = $("reg-password").value;

      if (!fullName) {
        if (errEl) errEl.textContent = "Please enter your full name or organization name.";
        return;
      }

      if (password.length < 8) {
        if (errEl) errEl.textContent = "Password must be at least 8 characters long.";
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        await setDoc(doc(db, "users", user.uid), {
          name: fullName,
          email: email,
          createdAt: new Date().toISOString()
        }, { merge: true });

      } catch (err) {
        if (errEl) errEl.textContent = err.message.replace("Firebase: ", "");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => signOut(auth);
  }

  let started = false;
  onAuthStateChanged(auth, async (user) => {
    const loginBox = $("login-box");
    const appBox = $("app-box");
    const userName = $("user-name");

    if (loginBox) loginBox.hidden = !!user;
    if (appBox) appBox.hidden = !user;
    if (!user) return;

    if (userName) userName.textContent = user.displayName || user.email;

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || user.email,
        email: user.email
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }

    if (!started) {
      started = true;
      if (typeof onUserLoggedIn === "function") onUserLoggedIn();
    }
  });
}