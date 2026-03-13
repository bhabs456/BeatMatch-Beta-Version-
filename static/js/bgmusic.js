const music = document.getElementById("bgmusic");

document.addEventListener(
  "click",
  () => {
    if (music.paused) {
      music.volume = 0.35;
      music.play().catch((err) => console.log(err));
    }
  },
  { once: true },
);
