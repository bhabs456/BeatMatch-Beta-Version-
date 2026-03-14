const reveals = document.querySelectorAll(".reveal");
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.12 },
);
reveals.forEach((el) => obs.observe(el));

const btns = document.querySelectorAll(".beat-btn");

if (btns.length) {
  const seq = [0, 3, 2, 1, 4, 7, 5, 6];
  let idx = 0,
    lastActive = null;

  setInterval(() => {
    if (lastActive) lastActive.classList.remove("active");

    const t = btns[seq[idx % seq.length]];

    if (!t) return;

    t.classList.add("active");
    lastActive = t;
    idx++;

    setTimeout(() => {
      t.classList.remove("active");
      lastActive = null;
    }, 340);
  }, 900);
}

let score = 12840;
setInterval(() => {
  score += Math.floor(Math.random() * 80 + 20) * (Math.random() > 0.15 ? 1 : 0);
  const scoreEl = document.getElementById("previewScore");

  if (scoreEl) {
    scoreEl.textContent = score.toLocaleString();
  }
}, 2200);

async function loadLeaderboard() {
  const userId = localStorage.getItem("user_id") || 0;

  const res = await fetch(`/get_leaderboard/${userId}`);

  if (!res.ok) {
    console.error("Leaderboard API failed");
    return;
  }

  const data = await res.json();
  const players = data.top || [];

  const container = document.getElementById("leaderboardRows");
  if (!container) return;
  container.innerHTML = "";

  let html = "";

  players.slice(0, 5).forEach((p, i) => {
    let rankClass = "rn";
    let scoreClass = "sn";
    let avatar = "🎮";
    let avatarClass = "lb-avatar";

    if (i === 0) {
      rankClass = "r1";
      scoreClass = "s1";
      avatar = "👑";
      avatarClass = "lb-avatar crown";
    } else if (i === 1) {
      rankClass = "r2";
      scoreClass = "s2";
      avatar = "🎧";
    } else if (i === 2) {
      rankClass = "r3";
      scoreClass = "s2";
      avatar = "🔥";
    } else if (i === 4) {
      avatar = "⚡";
    }

    html += `
  <div class="lb-row">

    <span class="lb-rank ${rankClass}">
      ${String(i + 1).padStart(2, "0")}
    </span>

    <div class="${avatarClass}">
      ${avatar}
    </div>

    <span class="lb-name">${p.username}</span>

    <span class="lb-level">
      LVL ${p.highest_level}
    </span>

    <span class="lb-score ${scoreClass}">
      ${(p?.highest_score || 0).toLocaleString()}
    </span>

  </div>
  `;
  });

  container.innerHTML = html;
}

loadLeaderboard();

// document.addEventListener("DOMContentLoaded", () => {
//   const music = document.getElementById("bgMusic");

//   if (!music) return;

//   music.volume = 0.35; // keep background music soft

//   music.play().catch(() => {
//     // browsers block autoplay until user interacts
//     document.addEventListener(
//       "click",
//       () => {
//         music.play();
//       },
//       { once: true },
//     );
//   });
// });
