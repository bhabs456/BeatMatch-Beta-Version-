/* ── PARTICLES ── */
const pEl = document.getElementById("particles");
const notes = ["♩", "♪", "♫", "♬", "🎵", "🎶", "✦", "◆", "⭐"];

for (let i = 0; i < 24; i++) {
  const p = document.createElement("div");
  p.className = "particle";
  p.textContent = notes[Math.floor(Math.random() * notes.length)];
  p.style.cssText = `left:${Math.random() * 100}%;bottom:-5%;--dur:${5 + Math.random() * 10}s;--delay:${Math.random() * 12}s;font-size:${10 + Math.random() * 14}px;opacity:0;`;
  pEl.appendChild(p);
}

/* ── EQUALIZER ── */
const eqEl = document.getElementById("equalizer");

for (let i = 0; i < 80; i++) {
  const b = document.createElement("div");
  b.className = "eq-bar";
  b.style.cssText = `height:${15 + Math.random() * 40}px;--spd:${0.3 + Math.random() * 0.7}s;animation-delay:${Math.random() * 0.8}s;`;
  eqEl.appendChild(b);
}

/* ── LEADERBOARD ── */

async function loadLeaderboard() {
  const userId = localStorage.getItem("user_id") || 0;

  const res = await fetch(`/get_leaderboard/${userId}`);

  if (!res.ok) {
    const text = await res.text();
    console.error("Leaderboard API failed:", text);
    return;
  }

  const data = await res.json();

  const players = data.top || [];

  // TOP 3 PODIUM
  if (players.length >= 1) {
    document.getElementById("p1_name").textContent = players[0].username;
    document.getElementById("p1_score").textContent = players[0].highest_score;
    document.getElementById("p1_level").textContent =
      "LVL " + players[0].highest_level;
  }

  if (players.length >= 2) {
    document.getElementById("p2_name").textContent = players[1].username;
    document.getElementById("p2_score").textContent = players[1].highest_score;
    document.getElementById("p2_level").textContent =
      "LVL " + players[1].highest_level;
  }

  if (players.length >= 3) {
    document.getElementById("p3_name").textContent = players[2].username;
    document.getElementById("p3_score").textContent = players[2].highest_score;
    document.getElementById("p3_level").textContent =
      "LVL " + players[2].highest_level;
  }
  const currentUser = data.user;

  const container = document.getElementById("tbodyRows");
  container.innerHTML = "";

  /* TOP 10 */

  players.slice(3).forEach((p, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td class="rank-cell">${i + 4}</td>

    <td>
      <div class="player-cell">
        <span class="player-name">${p.username}</span>
      </div>
    </td>

    <td style="text-align:center">
      <span class="level-badge">LVL ${p.highest_level}</span>
    </td>

    <td class="score-cell">
      ${p.highest_score.toLocaleString()}
    </td>
    `;
    container.appendChild(row);
  });

  if (currentUser && currentUser.rank > 10) {
    const divider = document.createElement("tr");
    divider.innerHTML = `<td colspan="4">...</td>`;
    container.appendChild(divider);

    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${currentUser.rank}</td>
    <td>${currentUser.username} (YOU)</td>
    <td>LVL ${currentUser.highest_level}</td>
    <td>${currentUser.highest_score.toLocaleString()}</td>
  `;

    container.appendChild(row);
  }
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
