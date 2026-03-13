/* ── PARTICLE CANVAS ── */
(function () {
  const cv = document.getElementById("particles"),
    ctx = cv.getContext("2d");
  let W,
    H,
    pts = [];
  const C = ["#c93cff", "#00f5ff", "#ff2d78", "#39ff6e", "#ffb800"];
  function resize() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
  }
  function P() {
    this.reset();
  }
  P.prototype.reset = function () {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.4 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.32;
    this.vy = (Math.random() - 0.5) * 0.32;
    this.a = Math.random() * 0.45 + 0.12;
    this.c = C[Math.floor(Math.random() * C.length)];
    this.life = Math.random() * 180 + 90;
    this.age = 0;
  };
  P.prototype.tick = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (
      this.age > this.life ||
      this.x < 0 ||
      this.x > W ||
      this.y < 0 ||
      this.y > H
    )
      this.reset();
  };
  P.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c;
    ctx.globalAlpha = this.a * (1 - this.age / this.life);
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.c;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };
  function init() {
    resize();
    pts = Array.from({ length: 75 }, () => new P());
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p) => {
      p.tick();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  addEventListener("resize", resize);
  init();
  loop();
})();

/* ── SCROLL REVEAL ── */
const obs = new IntersectionObserver(
  (es) => {
    es.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.07 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

/* ── STAT COUNTERS ── */
function count(el) {
  const t = parseInt(el.dataset.target, 10),
    sx = el.dataset.suffix || "",
    dur = 1600,
    s = performance.now();
  (function f(now) {
    const p = Math.min((now - s) / dur, 1),
      e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * t).toLocaleString() + sx;
    if (p < 1) requestAnimationFrame(f);
  })(s);
}
new IntersectionObserver(
  (es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".stat-value[data-target]").forEach(count);
        obs.unobserve && null;
      }
    });
  },
  { threshold: 0.3 },
).observe(document.querySelector(".stats-grid"));

// Achievements
async function loadAchievements() {
  const response = await fetch("/api/achievements");
  const achievements = await response.json();

  const grid = document.querySelector(".achievements-grid");

  grid.innerHTML = "";

  achievements.forEach((a) => {
    const locked = a.unlocked_at ? "" : "locked";

    const card = `
        <div class="ach-card ${locked}">
            <span class="ach-icon">🏆</span>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.description}</div>
            ${
              a.unlocked_at
                ? `<div class="ach-date">Unlocked ${new Date(a.unlocked_at).toLocaleDateString()}</div>`
                : `<div class="ach-lock-icon">🔒</div>`
            }
        </div>
        `;

    grid.innerHTML += card;
  });
}

loadAchievements();

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
