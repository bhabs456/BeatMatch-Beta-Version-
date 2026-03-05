let systemPattern = [];
let userPattern = [];
let isUserTurn = false;
let beatIndex = 0;
let repeatCount = 0;
let beatTimer = null;
let gameState = "waiting";
let pauseTimer = null;
let totalHits = 0;
let correctHits = 0;
let currentBeatSpeed = 500;
let wrongAttempts = 0;

function generatePattern() {
  const keys = ["a", "s", "d", "f", "g", "h"];

  systemPattern = [];

  let stage = Math.floor((level - 1) / 2);

  let patternLength = 3 + stage;

  // cap the difficulty after 6 beats
  patternLength = Math.min(patternLength, 6);

  for (let i = 0; i < patternLength; i++) {
    const randKey = keys[Math.floor(Math.random() * keys.length)];

    systemPattern.push(randKey);
  }
}

function playSystemBeat() {
  const key = systemPattern[beatIndex];

  playSound(key);
  highlightPad(key);

  beatIndex++;

  if (beatIndex >= systemPattern.length) {
    beatIndex = 0;
    repeatCount++;

    clearInterval(beatTimer);

    if (repeatCount >= 2) {
      pauseTimer = setTimeout(() => {
        startUserTurn();
      }, 1000);
    } else {
      pauseTimer = setTimeout(() => {
        beatTimer = setInterval(playSystemBeat, currentBeatSpeed);
      }, 1000);
    }
  }
}

function startSystemTurn(nextLevel = true) {
  clearInterval(beatTimer);
  clearTimeout(pauseTimer);

  gameState = "system";
  isUserTurn = false;

  beatIndex = 0;
  repeatCount = 0;

  if (nextLevel) {
    generatePattern();
  }

  currentBeatSpeed = getBeatSpeed(); // lock speed for this round

  document.getElementById("feedbackMsg").textContent =
    "🎧 System is playing the beat...";

  beatTimer = setInterval(playSystemBeat, currentBeatSpeed);
}

function getBeatSpeed() {
  let stage = Math.floor((level - 1) / 2);

  let speed = 500 - stage * 50;

  return Math.max(300, speed);
}

function startUserTurn() {
  gameState = "user";
  isUserTurn = true;
  userPattern = [];
  beatIndex = 0;

  document.getElementById("feedbackMsg").textContent =
    "🎯 Your turn! Repeat the beat.";
}

function checkUserInput() {
  const index = userPattern.length - 1;

  totalHits++;

  if (userPattern[index] !== systemPattern[index]) {
    wrongAttempts++;

    combo = 0;
    document.getElementById("comboVal").textContent = combo;

    updateAccuracy();

    if (wrongAttempts >= 3) {
      document.getElementById("feedbackMsg").textContent =
        "❌ Too many mistakes! Game reset.";

      setTimeout(() => {
        resetGame();
      }, 2000);

      return;
    }

    document.getElementById("feedbackMsg").textContent =
      "❌ Wrong beat! Try again.";

    setTimeout(() => {
      startSystemTurn(false);
    }, 2000);

    return;
  }

  correctHits++;

  updateAccuracy();

  if (userPattern.length === systemPattern.length) {
    gameState = "waiting";
    isUserTurn = false;

    wrongAttempts = 0;

    combo++; // combo increases only when full pattern correct

    const comboEl = document.getElementById("comboVal");
    comboEl.classList.add("bump");

    setTimeout(() => {
      comboEl.classList.remove("bump");
    }, 300);

    document.getElementById("comboVal").textContent = combo;

    level++;

    document.getElementById("statLevel").textContent = level;

    document.getElementById("feedbackMsg").textContent =
      "✅ Perfect! Next Level";

    setTimeout(startSystemTurn, 2000);
  }
}

function updateAccuracy() {
  let accuracy = Math.round((correctHits / totalHits) * 100);

  if (!isFinite(accuracy)) accuracy = 0;

  document.getElementById("accuracyVal").textContent = accuracy + "%";
}

/* ── PARTICLES ── */
const particlesEl = document.getElementById("particles");
["♩", "♪", "♫", "♬", "🎵", "🎶", "⭐", "✦", "◆"].forEach((sym, _) => {
  for (let i = 0; i < 3; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = sym;
    p.style.cssText = `left:${Math.random() * 100}%;bottom:-5%;--dur:${5 + Math.random() * 10}s;--delay:${Math.random() * 12}s;font-size:${12 + Math.random() * 16}px;opacity:0`;
    particlesEl.appendChild(p);
  }
});

/* ── EQUALIZER ── */
const eqEl = document.getElementById("equalizer");
for (let i = 0; i < 80; i++) {
  const b = document.createElement("div");
  b.className = "eq-bar";
  b.style.cssText = `height:${15 + Math.random() * 45}px;--spd:${0.3 + Math.random() * 0.7}s;animation-delay:${Math.random() * 0.8}s`;
  eqEl.appendChild(b);
}

/* ══════════════════════════════════════════
   AUTH — Login / Signup / Guest
══════════════════════════════════════════ */
const loginBtn = document.getElementById("loginBtn");
const profileWrap = document.getElementById("profileWrap");
const profileAvatarBtn = document.getElementById("profileAvatarBtn");
const profileDropdown = document.getElementById("profileDropdown");
const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");
const doLoginBtn = document.getElementById("doLoginBtn");
const doSignupBtn = document.getElementById("doSignupBtn");
const guestPlay = document.getElementById("guestPlay");
const ddLogout = document.getElementById("ddLogout");
const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const panelLogin = document.getElementById("panelLogin");
const panelSignup = document.getElementById("panelSignup");

// Demo user store
const USERS = {
  beatmaster: {
    password: "1234",
    email: "beatmaster@beatmatch.io",
    avatar: "🎧",
    rank: "PRO",
  },
  neonviper: {
    password: "1234",
    email: "neonviper@beatmatch.io",
    avatar: "🐍",
    rank: "ACE",
  },
  guest: {
    password: "",
    email: "guest@beatmatch.io",
    avatar: "👾",
    rank: "ROOKIE",
  },
};
let currentUser = null;

function openModal(tab = "login") {
  authModal.classList.add("active");
  switchTab(tab);
  loginError.textContent = "";
  signupError.textContent = "";
  [
    "loginUser",
    "loginPass",
    "signupUser",
    "signupEmail",
    "signupPass",
    "signupPass2",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  setTimeout(
    () =>
      document
        .getElementById(tab === "login" ? "loginUser" : "signupUser")
        .focus(),
    120,
  );
}
function closeModal() {
  authModal.classList.remove("active");
}

function switchTab(tab) {
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

function applyLogin(name, userData) {
  currentUser = { name, ...userData };
  closeModal();
  document.getElementById("ddAvatarLg").textContent = currentUser.avatar;
  document.getElementById("ddUsername").textContent = currentUser.name;
  document.getElementById("ddEmail").textContent = currentUser.email;
  profileAvatarBtn.innerHTML =
    currentUser.avatar + '<span class="online-dot"></span>';
  loginBtn.style.display = "none";
  profileWrap.style.display = "block";
}

// Login
doLoginBtn.addEventListener("click", () => {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value;
  loginError.textContent = "";
  if (!u) {
    loginError.textContent = "⚠ Enter a username";
    return;
  }
  const key = u.toLowerCase();
  if (!USERS[key]) {
    loginError.textContent = "⚠ User not found";
    return;
  }
  if (USERS[key].password && USERS[key].password !== p) {
    loginError.textContent = "⚠ Wrong password";
    return;
  }
  applyLogin(u, USERS[key]);
});

// Signup
doSignupBtn.addEventListener("click", () => {
  const u = document.getElementById("signupUser").value.trim();
  const em = document.getElementById("signupEmail").value.trim();
  const p = document.getElementById("signupPass").value;
  const p2 = document.getElementById("signupPass2").value;
  signupError.textContent = "";
  if (!u) {
    signupError.textContent = "⚠ Choose a username";
    return;
  }
  if (!em || !em.includes("@")) {
    signupError.textContent = "⚠ Enter a valid email";
    return;
  }
  if (p.length < 4) {
    signupError.textContent = "⚠ Password must be 4+ chars";
    return;
  }
  if (p !== p2) {
    signupError.textContent = "⚠ Passwords do not match";
    return;
  }
  // Register new user
  USERS[u.toLowerCase()] = {
    password: p,
    email: em,
    avatar: "🎮",
    rank: "ROOKIE",
  };
  applyLogin(u, USERS[u.toLowerCase()]);
});

// Guest
guestPlay.addEventListener("click", () => applyLogin("Guest", USERS["guest"]));

// Tabs
tabLogin.addEventListener("click", () => switchTab("login"));
tabSignup.addEventListener("click", () => switchTab("signup"));
document
  .getElementById("switchToSignup")
  .addEventListener("click", () => switchTab("signup"));
document
  .getElementById("switchToLogin")
  .addEventListener("click", () => switchTab("login"));

// Enter key in modal
["loginUser", "loginPass"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLoginBtn.click();
  });
});
["signupUser", "signupEmail", "signupPass", "signupPass2"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSignupBtn.click();
  });
});

// Open / close modal
loginBtn.addEventListener("click", () => openModal("login"));
authClose.addEventListener("click", closeModal);
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) closeModal();
});

// Dropdown toggle
profileAvatarBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  syncDropdownStats();
  profileDropdown.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (!profileWrap.contains(e.target)) profileDropdown.classList.remove("open");
});

// Logout
ddLogout.addEventListener("click", () => {
  currentUser = null;
  profileDropdown.classList.remove("open");
  profileWrap.style.display = "none";
  loginBtn.style.display = "";
});

// Menu item placeholders
document.getElementById("ddProfile").addEventListener("click", () => {
  profileDropdown.classList.remove("open");
  alert("👤 Profile page coming soon!");
});
document.getElementById("ddSettings").addEventListener("click", () => {
  profileDropdown.classList.remove("open");
  alert("⚙️ Settings coming soon!");
});
document.getElementById("ddAchievements").addEventListener("click", () => {
  profileDropdown.classList.remove("open");
  alert("🏆 Achievements coming soon!");
});

/* ══════════════════════════════════════════
   GAME STATE
══════════════════════════════════════════ */
let score = 0,
  level = 1,
  combo = 0,
  hits = 0,
  total = 0,
  bestCombo = 0;

function syncDropdownStats() {
  document.getElementById("ddStatScore").textContent = score;
  document.getElementById("ddStatLevel").textContent = level;
  document.getElementById("ddStatCombo").textContent = bestCombo;
}

function updateStats() {
  const sv = document.getElementById("statScore");
  const lv = document.getElementById("statLevel");
  sv.classList.remove("bump");
  lv.classList.remove("bump");
  void sv.offsetWidth;
  sv.textContent = score;
  sv.classList.add("bump");
  lv.textContent = level;
  document.getElementById("comboVal").textContent = combo;
  document.getElementById("accuracyVal").textContent =
    acc === "--" ? "--%" : acc + "%";
  const pct = Math.min(100, Math.floor((score / (level * 500)) * 100));
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressPct").textContent = pct + "%";

  if (currentUser) syncDropdownStats();
}

const feedbackMap = {
  perfect: ["🔥 PERFECT!", "⚡ ON FIRE!", "✨ FLAWLESS!"],
  good: ["👍 NICE!", "🎯 GOOD HIT!", "💫 SOLID!"],
  ok: ["👌 OK!", "🙂 NOT BAD!"],
};
function showFeedback(type) {
  const arr = feedbackMap[type];
  const el = document.getElementById("feedbackMsg");
  el.textContent = arr[Math.floor(Math.random() * arr.length)];
  el.style.color =
    type === "perfect"
      ? "var(--secondary-neon)"
      : type === "good"
        ? "var(--accent-green)"
        : "var(--text-secondary)";
  setTimeout(() => {
    el.textContent = "";
    el.style.color = "";
  }, 900);
}

const soundMap = {
  a: new Audio("../assets/sounds/Kick.mp3"),
  s: new Audio("../assets/sounds/Snare1.mp3"),
  d: new Audio("../assets/sounds/Clap.mp3"),
  f: new Audio("../assets/sounds/Hi_Hat.mp3"),
  g: new Audio("../assets/sounds/Snare2.mp3"),
  h: new Audio("../assets/sounds/Snare3.mp3"),
};

function playBeatLoop() {
  const pattern = beatLevels[level - 1];
  const key = pattern[beatIndex];

  hitPad(key);

  beatIndex++;

  if (beatIndex >= pattern.length) {
    beatIndex = 0;
  }
}

function playerHit(key) {
  // Always play the sound
  playSound(key);
  highlightPad(key);

  // Only check pattern if it's user turn
  if (gameState !== "user") return;

  userPattern.push(key);
  checkUserInput();
}

// Pad clicks
document.querySelectorAll(".drum-pad").forEach((pad) => {
  pad.addEventListener("click", () => {
    playerHit(pad.dataset.key);
  });
});

// Keyboard
document.addEventListener("keydown", (e) => {
  playerHit(e.key.toLowerCase());
});

// Play button
const playBtn = document.getElementById("playBtn");
let playing = false;
playBtn.addEventListener("click", function () {
  playing = !playing;

  if (playing) {
    startSystemTurn();
    this.textContent = "⏸ Stop Game";
  } else {
    clearInterval(beatTimer);
    clearTimeout(pauseTimer); // 🔴 THIS IS THE MISSING LINE

    gameState = "waiting";
    isUserTurn = false;

    document.getElementById("feedbackMsg").textContent = "⏹ Game stopped";

    this.textContent = "▶ Start Game";
  }
});

function playSound(key) {
  const sound = soundMap[key];

  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function highlightPad(key) {
  const pad = document.querySelector(`.drum-pad[data-key="${key}"]`);

  if (!pad) return;

  pad.classList.add("hit");

  setTimeout(() => {
    pad.classList.remove("hit");
  }, 200);
}

// Reset
document.getElementById("resetBtn").addEventListener("click", () => {
  // stop all running timers
  clearInterval(beatTimer);
  clearTimeout(pauseTimer);

  // reset game state
  playing = false;
  gameState = "waiting";
  isUserTurn = false;

  // reset gameplay variables
  level = 1;
  combo = 0;
  beatIndex = 0;
  repeatCount = 0;
  wrongAttempts = 0;

  // reset patterns
  systemPattern = [];
  userPattern = [];

  // reset stats
  hits = 0;
  total = 0;
  totalHits = 0;
  correctHits = 0;

  // reset UI
  document.getElementById("statLevel").textContent = level;
  document.getElementById("comboVal").textContent = combo;
  document.getElementById("accuracyVal").textContent = "0%";

  document.getElementById("feedbackMsg").textContent =
    "Game reset. Press Start.";

  // 🔴 reset play button
  playBtn.textContent = "▶ Start Game";
});

function resetGame() {
  clearInterval(beatTimer);
  clearTimeout(pauseTimer);

  playing = false;

  level = 1;
  combo = 0;
  wrongAttempts = 0;

  systemPattern = [];
  userPattern = [];

  beatIndex = 0;
  repeatCount = 0;

  playBtn.textContent = "▶ Start Game";

  document.getElementById("statLevel").textContent = level;
  document.getElementById("comboVal").textContent = combo;
  document.getElementById("accuracyVal").textContent = "0%";

  document.getElementById("feedbackMsg").textContent =
    "Game reset. Press Start.";
}
