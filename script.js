// script.js
const state = {
  query: "",
  activeTags: new Set(),
  sort: "popular",
  games: [],
  tags: []
};

const els = {
  grid: document.getElementById("grid"),
  tags: document.getElementById("tags"),
  search: document.getElementById("search"),
  sort: document.getElementById("sort"),
  empty: document.getElementById("empty"),
  themeToggle: document.getElementById("themeToggle")
};

init();

async function init() {
  const res = await fetch("/games.json");
  state.games = await res.json();
  state.tags = Array.from(new Set(state.games.flatMap(g => g.tags))).sort();
  renderTags();
  render();
  wire();
}

function wire() {
  els.search.addEventListener("input", e => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });

  els.sort.addEventListener("change", e => {
    state.sort = e.target.value;
    render();
  });

  els.themeToggle.addEventListener("click", () => {
    const light = document.documentElement.classList.toggle("light");
    els.themeToggle.textContent = light ? "☀️" : "🌙";
    localStorage.setItem("theme", light ? "light" : "dark");
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light");
    els.themeToggle.textContent = "☀️";
  }
}

function renderTags() {
  els.tags.innerHTML = "";
  state.tags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag";
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      if (state.activeTags.has(tag)) state.activeTags.delete(tag);
      else state.activeTags.add(tag);
      btn.classList.toggle("active");
      render();
    });
    els.tags.appendChild(btn);
  });
}

function render() {
  let list = state.games.slice();

  if (state.query) {
    list = list.filter(g =>
      g.title.toLowerCase().includes(state.query) ||
      (g.description || "").toLowerCase().includes(state.query)
    );
  }

  if (state.activeTags.size) {
    list = list.filter(g => g.tags.some(t => state.activeTags.has(t)));
  }

  if (state.sort === "az") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (state.sort === "new") {
    list.sort((a, b) => (b.added || 0) - (a.added || 0));
  } else {
    list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  els.grid.innerHTML = "";
  list.forEach(g => els.grid.appendChild(card(g)));
  els.empty.hidden = list.length > 0;
}

function card(g) {
  const el = document.createElement("article");
  el.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "thumb";
  const bg = g.thumbnail || "";
  if (bg) thumb.style.backgroundImage = `url(${bg})`;
  thumb.textContent = bg ? "" : "No preview";

  const content = document.createElement("div");
  content.className = "content";
  const h3 = document.createElement("h3");
  h3.textContent = g.title;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = (g.tags || []).join(" • ");

  const play = document.createElement("a");
  play.className = "play";
  play.href = g.url;
  play.target = "_blank";
  play.rel = "noopener noreferrer";
  play.textContent = "Play";

  content.append(h3, meta, play);
  el.append(thumb, content);
  return el;
}
