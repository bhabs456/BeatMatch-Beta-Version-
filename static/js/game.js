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
let misses = 0;
let beatTimes = [];
let userStartTime = 0;
let beatTimeline = [];
let scoreSaved = false;


window.addEventListener("load", () => {
  const user = localStorage.getItem("user_id");

  if (user) {
    loginBtn.style.display = "none";
    profileWrap.style.display = "block";
    loadProfile();
  }

  updateStats();
});

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

  beatTimeline.push(performance.now());

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
  beatTimeline = [];
  beatTimes = [];
  userPattern = [];
  updateStats();
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
  clearInterval(beatTimer);
  clearTimeout(pauseTimer);

  gameState = "user";
  isUserTurn = true;

  userPattern = [];
  beatIndex = 0;

  userStartTime = Date.now();

  document.getElementById("feedbackMsg").textContent =
    "🎯 Your turn! Repeat the beat.";
}

function checkUserInput() {
  const index = userPattern.length - 1;
  console.log("SYSTEM:", systemPattern);
  console.log("USER:", userPattern);

  // ❌ WRONG INPUT
  if (userPattern[index] !== systemPattern[index]) {
    playGameSound("wrong");
    wrongAttempts++;
    combo = 0;

    misses++;
    updateAccuracy();

    document.getElementById("comboVal").textContent = combo;

    if (wrongAttempts >= 2) {
      playGameSound("gameover");
      document.getElementById("feedbackMsg").textContent =
        "💀 Too many mistakes! Game Over.";

      saveScore(); // ⭐ THIS IS MISSING

      setTimeout(() => resetGame(), 1500);

      return;
    }

    let attemptsLeft = 2 - wrongAttempts;

    document.getElementById("feedbackMsg").textContent =
      `❌ Wrong beat! Attempts left: ${attemptsLeft}`;

    isUserTurn = false;

    setTimeout(() => startSystemTurn(false), 1500);

    return;
  }

  // ✅ CORRECT INPUT
  correctHits++;
  wrongAttempts = 0;

  hits++; // ⭐ add this
  updateAccuracy();
  updateStats(); // ⭐ progress increases only on correct hit

  // ✅ SEQUENCE COMPLETED
  if (userPattern.length === systemPattern.length) {
    gameState = "waiting";
    isUserTurn = false;

    combo++;
    wrongAttempts = 0;

    // track highest combo of this session
    if (combo > bestCombo) {
      bestCombo = combo;
    }

    document.getElementById("comboVal").textContent = combo;

    level++;
    playGameSound("levelUp");

    document.getElementById("statLevel").textContent = level;

    if (combo % 5 === 0) {
      playGameSound("combo");
    }

    // score for finishing sequence
    let points = systemPattern.length * 50;

    score += points;

    updateStats();

    document.getElementById("feedbackMsg").textContent =
      "✅ Perfect! Next Level";

    setTimeout(startSystemTurn, 2000);
  }
}

function updateScore(correct) {
  if (correct) {
    combo++;
    hits++;

    let multiplier = 1;

    if (combo >= 10) {
      multiplier = 3;
    } else if (combo >= 5) {
      multiplier = 2;
    }

    score += 10 * multiplier;
  } else {
    combo = 0;
    misses++;
  }

  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
  updateAccuracy();
}

function updateAccuracy() {
  let total = hits + misses;

  let accuracy = total === 0 ? 0 : ((hits / total) * 100).toFixed(1);

  document.getElementById("accuracyVal").textContent = accuracy + "%";
}

function getTimingResult(expectedTime) {
  const diff = Math.abs(Date.now() - expectedTime);

  if (diff <= 80) return { result: "perfect", bonus: 40 };

  if (diff <= 150) return { result: "good", bonus: 20 };

  if (diff <= 250) return { result: "ok", bonus: 5 };

  return { result: "miss", bonus: 0 };
}

function addScore(expectedTime) {
  const timing = getTimingResult(expectedTime);

  const base = 5;

  let gained = (base + timing.bonus) * Math.max(1, combo);

  score += gained;

  document.getElementById("statScore").textContent = score;

  showFeedback(timing.result);
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
for (let i = 0; i < 20; i++) {
  const b = document.createElement("div");
  b.className = "eq-bar";
  b.style.cssText = `height:${15 + Math.random() * 45}px;--spd:${0.3 + Math.random() * 0.7}s;animation-delay:${Math.random() * 0.8}s`;
  eqEl.appendChild(b);
}

/* ══════════════════════════════════════════
   GAME STATE
══════════════════════════════════════════ */
let score = 0,
  level = 1,
  combo = 0,
  hits = 0,
  total = 0,
  bestCombo = 0;

function updateStats() {
  document.getElementById("statScore").textContent = score;
  document.getElementById("statLevel").textContent = level;
  document.getElementById("comboVal").textContent = combo;

  const totalBeats = systemPattern.length || 1;
  const progress = userPattern.length / totalBeats;

  const pct = Math.min(100, Math.floor(progress * 100));

  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressPct").textContent = pct + "%";
}

const feedbackMap = {
  perfect: ["🔥 PERFECT!", "⚡ ON FIRE!", "✨ FLAWLESS!"],
  good: ["👍 NICE!", "🎯 GOOD HIT!", "💫 SOLID!"],
  ok: ["👌 OK!", "🙂 NOT BAD!"],
  miss: ["❌ MISS!", "⏱ TOO LATE!", "⚠ OFF BEAT!"],
};

function showFeedback(type) {
  const arr = feedbackMap[type] || ["🎵"];

  const el = document.getElementById("feedbackMsg");

  el.textContent = arr[Math.floor(Math.random() * arr.length)];
}

const soundMap = {
  a: new Audio("/static/sounds/Kick.mp3"),
  s: new Audio("/static/sounds/Snare1.mp3"),
  d: new Audio("/static/sounds/Clap.mp3"),
  f: new Audio("/static/sounds/Hi_Hat.mp3"),
  g: new Audio("/static/sounds/Snare2.mp3"),
  h: new Audio("/static/sounds/Snare3.mp3"),
};

const gameSounds = {
  levelUp: new Audio("/static/sounds/correct.mp3"),
  reset: new Audio("/static/sounds/Reset.mp3"),
  wrong: new Audio("/static/sounds/WrongAttempt.mp3"),
  gameover: new Audio("/static/sounds/GameOver.mp3"),
  combo: new Audio("/static/sounds/Combo.mp3"),
};

Object.values(gameSounds).forEach((s) => s.load());
Object.values(soundMap).forEach((sound) => sound.load());

function playGameSound(name) {
  const s = gameSounds[name];

  if (!s) return;

  s.currentTime = 0;
  s.play().catch(e => console.log("Audio not ready:", e));
}

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
  playSound(key);
  highlightPad(key);

  if (!playing || !isUserTurn) return;

  if (userPattern.length >= systemPattern.length) return;

  userPattern.push(key);

  // updateStats();   // ⭐ update progress

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
  if (!e.key) return;

  playerHit(e.key.toLowerCase());
});

// Play button
const playBtn = document.getElementById("playBtn");
let playing = false;
playBtn.addEventListener("click", function () {
  const user_id = localStorage.getItem("user_id");

  if (!user_id) {
    openModal("login");
    return;
  }

  playing = !playing;

  if (playing) {
    playGameSound("levelUp");
    scoreSaved = false;
    startSystemTurn();
    updateStats();
    this.textContent = "⏸ Stop Game";
  } else {
    saveScore(); // save score when stopping

    clearInterval(beatTimer);
    clearTimeout(pauseTimer);

    gameState = "waiting";
    isUserTurn = false;

    document.getElementById("feedbackMsg").textContent = "⏹ Game stopped";

    this.textContent = "▶ Start Game";
  }
});

function playSound(key) {
  const original = soundMap[key];
  if (!original) return;

  original.currentTime = 0; 
  original.play().catch(e => console.log("Audio not ready:", e));
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
function resetGame() {
  playGameSound("reset");
  // stop system timers
  clearInterval(beatTimer);
  clearTimeout(pauseTimer);

  // stop gameplay
  playing = false;
  gameState = "waiting";
  isUserTurn = false;

  // reset game variables
  level = 1;
  score = 0;
  combo = 0;
  wrongAttempts = 0;
  bestCombo = 0;

  beatIndex = 0;
  repeatCount = 0;

  // reset patterns
  systemPattern = [];
  userPattern = [];
  beatTimeline = [];

  // reset stats
  hits = 0;
  misses = 0;

  combo = 0;
  updateStats();

  // update UI
  document.getElementById("statScore").textContent = score;
  document.getElementById("statLevel").textContent = level;
  document.getElementById("comboVal").textContent = 0;
  document.getElementById("accuracyVal").textContent = "0%";

  document.getElementById("feedbackMsg").textContent =
    "Game reset. Press Start.";

  playBtn.textContent = "▶ Start Game";
}

async function saveScore() {
  const user_id = localStorage.getItem("user_id");

  if (!user_id) return;

  const accuracyText = document.getElementById("accuracyVal").textContent;
  const accuracy = parseFloat(accuracyText);

  await fetch("/save_score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user_id,
      score: score,
      level: level,
      combo: bestCombo,
      accuracy: accuracy,
    }),
  });
}

document.getElementById("resetBtn").addEventListener("click", async () => {
  await saveScore(); // ⭐ store score in DB first

  resetGame(); // then reset gameplay
});
