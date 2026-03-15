/* ======================================
   AUTH SYSTEM — BeatMatch
====================================== */

let currentUser = null;

/* ---------- ELEMENTS ---------- */

const loginBtn = document.getElementById("loginBtn");
const profileWrap = document.getElementById("profileWrap");
const profileAvatarBtn = document.getElementById("profileAvatarBtn");
const profileDropdown = document.getElementById("profileDropdown");

const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");

const doLoginBtn = document.getElementById("doLoginBtn");
const doSignupBtn = document.getElementById("doSignupBtn");

const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");

const panelLogin = document.getElementById("panelLogin");
const panelSignup = document.getElementById("panelSignup");

const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");

const ddLogout = document.getElementById("ddLogout");

/* ---------- MODAL ---------- */

function openModal(tab = "login") {
  if (!authModal) return;

  authModal.classList.add("active");
  switchTab(tab);

  if (loginError) loginError.textContent = "";
  if (signupError) signupError.textContent = "";
}

function closeModal() {
  if (authModal) authModal.classList.remove("active");
}

function switchTab(tab) {
  if (!tabLogin || !tabSignup || !panelLogin || !panelSignup) return;

  if (tab === "login") {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");

    panelLogin.style.display = "";
    panelSignup.style.display = "none";
  } else {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");

    panelSignup.style.display = "";
    panelLogin.style.display = "none";
  }
}

/* ---------- LOGIN ---------- */

async function loginUser() {
  const identifier = document.getElementById("loginUser")?.value;
  const password = document.getElementById("loginPass")?.value;

  if (!identifier || !password) return;

  const res = await fetch("/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier,
      password,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("user_id", data.user_id);

    if (loginBtn) loginBtn.style.display = "none";
    if (profileWrap) profileWrap.style.display = "block";

    try {
      await loadProfile();
    } catch (e) {
        console.log("Profile could not be loaded initially.");
    }

    closeModal();
  } else {
    if (loginError) loginError.textContent = data.error || "Login failed";
  }
}

/* ---------- SIGNUP ---------- */

async function signupUser() {
  const username = document.getElementById("signupUser")?.value.trim();
  const email = document.getElementById("signupEmail")?.value.trim();
  const password = document.getElementById("signupPass")?.value;
  const confirm = document.getElementById("signupPass2")?.value;

  if (!username || !email || !password) {
    if (signupError) signupError.textContent = "⚠ Fill all fields";
    return;
  }

  if (password !== confirm) {
    if (signupError) signupError.textContent = "⚠ Passwords do not match";
    return;
  }

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Account created!");
    switchTab("login");
  } else {
    if (signupError) signupError.textContent = data.error || "Signup failed";
  }
}

/* ---------- PROFILE ---------- */

async function loadProfile() {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) return;

  const res = await fetch(`/profile/${user_id}`);
  const data = await res.json();

  const el = document.getElementById("ddUsername");
  if (el) el.textContent = data.username;
  document.getElementById("ddEmail").textContent = data.email;

  document.getElementById("ddStatScore").textContent = data.highest_score;
  document.getElementById("ddStatLevel").textContent = data.highest_level;
  document.getElementById("ddStatCombo").textContent = data.highest_combo;

  document.getElementById("ddRank").textContent =
    "⚡ GLOBAL RANK: #" + data.rank;
}

/* ---------- LOGOUT ---------- */

function logoutUser() {
  localStorage.removeItem("user_id");

  fetch("/logout").then(() => {
    window.location.href = "/";
  });
}

/* ---------- EVENT LISTENERS ---------- */

if (loginBtn) {
  loginBtn.addEventListener("click", () => openModal("login"));
}

if (authClose) {
  authClose.addEventListener("click", closeModal);
}

if (doLoginBtn) {
  doLoginBtn.addEventListener("click", loginUser);
}

if (doSignupBtn) {
  doSignupBtn.addEventListener("click", signupUser);
}

if (tabLogin) {
  tabLogin.addEventListener("click", () => switchTab("login"));
}

if (tabSignup) {
  tabSignup.addEventListener("click", () => switchTab("signup"));
}

if (profileAvatarBtn) {
  profileAvatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    profileDropdown.classList.toggle("open");

    loadProfile(); // run in background
  });
}

document.addEventListener("click", (e) => {
  if (profileWrap && !profileWrap.contains(e.target)) {
    profileDropdown?.classList.remove("open");
  }
});

if (ddLogout) {
  ddLogout.addEventListener("click", logoutUser);
}

const switchToSignup = document.getElementById("switchToSignup");
if (switchToSignup) {
  switchToSignup.addEventListener("click", () => switchTab("signup"));
}

const switchToLogin = document.getElementById("switchToLogin");
if (switchToLogin) {
  switchToLogin.addEventListener("click", () => switchTab("login"));
}

const guestPlay = document.getElementById("guestPlay");
if (guestPlay) {
  guestPlay.addEventListener("click", () => {
    window.location.href = "/game";
  });
}

/* ---------- AUTO LOGIN ---------- */

window.addEventListener("DOMContentLoaded", async () => {
  const user = localStorage.getItem("user_id");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (profileWrap) profileWrap.style.display = "block";

    await loadProfile(); // load profile correctly
  }
});

const startGameBtn = document.getElementById("startGameBtn");

if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    const user = localStorage.getItem("user_id");

    if (user) {
      window.location.href = "/game";
    } else {
      // Show modal, but let them know they can play as guest
      openModal("login");
    }
  });
}
