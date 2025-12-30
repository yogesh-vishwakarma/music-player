const audio = document.getElementById("audio");
const songName = document.getElementById("song-name");
const artistName = document.getElementById("artist-name");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const playlistEl = document.getElementById("playlist");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const fileInput = document.getElementById("fileInput");
const themeToggle = document.getElementById("themeToggle");

let songs = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = -1;
let isShuffle = false;
let isRepeat = false;

/* THEME */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  themeToggle.textContent = dark ? "☀️" : "🌙";
  themeToggle.classList.add("rotate");
  setTimeout(() => themeToggle.classList.remove("rotate"), 300);
  localStorage.setItem("theme", dark ? "dark" : "light");
};

/* CORE */
function loadSong(i) {
  if (!songs[i]) return;
  currentIndex = i;
  audio.src = songs[i].url;
  songName.textContent = songs[i].name;
  artistName.textContent = "Local File";
  audio.play();
  highlight();
}

function playPause() {
  if (!audio.src) return;
  audio.paused ? audio.play() : audio.pause();
}

audio.onplay = () => playBtn.textContent = "⏸";
audio.onpause = () => playBtn.textContent = "▶️";

audio.onended = () => {
  isRepeat ? (audio.currentTime = 0, audio.play()) : nextSong();
};

/* NAVIGATION */
function nextSong() {
  if (!songs.length) return;
  currentIndex = isShuffle
    ? Math.floor(Math.random() * songs.length)
    : (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
}

function prevSong() {
  if (!songs.length) return;
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
}

/* PROGRESS */
audio.ontimeupdate = () => {
  if (!audio.duration) return;
  progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  currentTimeEl.textContent = format(audio.currentTime);
  durationEl.textContent = format(audio.duration);
};

progressContainer.onclick = e => {
  audio.currentTime =
    (e.offsetX / progressContainer.clientWidth) * audio.duration;
};

/* CONTROLS */
volume.oninput = () => audio.volume = volume.value;

shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("shuffle-active", isShuffle);
};

repeatBtn.onclick = () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("repeat-active", isRepeat);
};

/* ADD / REMOVE */
fileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  songs.push({ name: file.name, url: URL.createObjectURL(file) });
  save();
  render();
  loadSong(songs.length - 1);
};

function removeSong(i) {
  songs.splice(i, 1);
  save();
  render();
  audio.pause();
}

/* PLAYLIST */
function render() {
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = i === currentIndex ? "active" : "";
    li.innerHTML = `<span>${s.name}</span><span class="remove">✖</span>`;
    li.onclick = () => loadSong(i);
    li.querySelector(".remove").onclick = e => {
      e.stopPropagation();
      removeSong(i);
    };
    playlistEl.appendChild(li);
  });
}

function highlight() {
  [...playlistEl.children].forEach((li, i) =>
    li.classList.toggle("active", i === currentIndex)
  );
}

function save() {
  localStorage.setItem("playlist", JSON.stringify(songs));
}

function format(t) {
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
}

/* INIT */
render();
playBtn.onclick = playPause;
nextBtn.onclick = nextSong;
prevBtn.onclick = prevSong;
