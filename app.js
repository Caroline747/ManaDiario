/* app.js - Gerador de Versículos Diários */

const FALLBACK_VERSES = [
  {
    text: "Bem-aventurados os pacificadores, pois serão chamados filhos de Deus.",
    ref: "Mateus 5:9",
    devotional: "A paz nasce quando escolhemos perdoar e estender compreensão.",
  },
  {
    text: "Seja forte e corajoso. Não tenha medo, nem desanime, pois o Senhor, o seu Deus, estará com você.",
    ref: "Josué 1:9",
    devotional: "Força vem de confiar que não estamos sozinhos.",
  },
  {
    text: "Não andeis ansiosos por coisa alguma; antes, em tudo, pela oração e súplica, com ação de graças, sejam as vossas petições conhecidas diante de Deus.",
    ref: "Filipenses 4:6",
    devotional: "A oração transforma ansiedade em paz.",
  },
  {
    text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.",
    ref: "Provérbios 3:5",
    devotional: "Confie, mesmo quando tudo parecer incerto.",
  },
];

const apiBase = "https://bible-api.com/"; // usado para buscas por referência

/* ====== App state ====== */
const state = { current: null };

/* ====== Elementos ====== */
const verseText = document.getElementById("verseText");
const verseRef = document.getElementById("verseRef");
const devotionalEl = document.getElementById("devotional");
const generateBtn = document.getElementById("generateBtn");
const favBtn = document.getElementById("favBtn");
const shareBtn = document.getElementById("shareBtn");

const openFavBtn = document.getElementById("openFav");
const openHistBtn = document.getElementById("openHist");

const favoritesSection = document.getElementById("favorites");
const homeSection = document.getElementById("home");
const historySection = document.getElementById("history");

const favList = document.getElementById("favList");
const histList = document.getElementById("histList");

const backFromFav = document.getElementById("backFromFav");
const clearFav = document.getElementById("clearFav");
const backFromHist = document.getElementById("backFromHist");
const clearHist = document.getElementById("clearHist");

/* ====== Storage helpers ====== */
function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFavorites() {
  return load("gv_favorites", []);
}
function getHistory() {
  return load("gv_history", []);
}

/* ====== UI renderers ====== */
function renderCurrent() {
  if (!state.current) return;
  verseText.textContent = state.current.text;
  verseRef.textContent = state.current.ref || "";
  devotionalEl.textContent = state.current.devotional || "";
  // update fav button
  const exists = getFavorites().some(
    (v) => v.ref === state.current.ref && v.text === state.current.text
  );
  favBtn.textContent = exists ? "❤️ Favoritado" : "🤍 Favoritar";
}

function renderFavorites() {
  const favs = getFavorites();
  favList.innerHTML = "";
  if (favs.length === 0) {
    favList.innerHTML =
      '<div style="color:var(--muted)">Nenhum favorito ainda.</div>';
    return;
  }
  favs.reverse().forEach((item) => {
    const el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = `<div style="font-family:'Playfair Display',serif">${item.text}</div><div class="item-ref">${item.ref}</div><div style="margin-top:8px"><button class='btn ghost' data-ref='${item.ref}'>Compartilhar</button> <button class='btn ghost' data-del='${item.ref}'>Remover</button></div>`;
    favList.appendChild(el);
  });
}

function renderHistory() {
  const hist = getHistory();
  histList.innerHTML = "";
  if (hist.length === 0) {
    histList.innerHTML =
      '<div style="color:var(--muted)">Histórico vazio.</div>';
    return;
  }
  hist
    .slice()
    .reverse()
    .forEach((item) => {
      const el = document.createElement("div");
      el.className = "list-item";
      el.innerHTML = `<div style="font-family:'Playfair Display',serif">${
        item.text
      }</div><div class="item-ref">${
        item.ref
      } <small style='color:var(--muted)'>— ${new Date(
        item.time
      ).toLocaleString()}</small></div><div style="margin-top:8px"><button class='btn ghost' data-ref='${
        item.ref
      }'>Ver</button></div>`;
      histList.appendChild(el);
    });
}

/* ====== Core features ====== */
async function generateRandom() {
  // estratégia: buscar aleatoriamente de FALLBACK_VERSES. Também tentamos busca na API se quisermos implementar referências dinâmicas.
  const rand = Math.floor(Math.random() * FALLBACK_VERSES.length);
  const chosen = FALLBACK_VERSES[rand];
  state.current = chosen;
  pushToHistory(chosen);
  renderCurrent();
}

function pushToHistory(item) {
  const hist = getHistory();
  hist.push({ ...item, time: Date.now() });
  save("gv_history", hist);
}

function toggleFavorite() {
  const favs = getFavorites();
  const existsIdx = favs.findIndex(
    (v) => v.ref === state.current.ref && v.text === state.current.text
  );
  if (existsIdx > -1) {
    favs.splice(existsIdx, 1);
  } else {
    favs.push(state.current);
  }
  save("gv_favorites", favs);
  renderCurrent();
}

async function shareCurrent() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: state.current.ref || "Versículo",
        text: `${state.current.text}\n— ${state.current.ref}`,
      });
    } catch (e) {
      console.log("share cancelled", e);
    }
  } else {
    // fallback: copiar para clipboard
    const text = `${state.current.text}\n— ${state.current.ref}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Versículo copiado para a área de transferência.");
    } catch (e) {
      alert("Compartilhar não suportado neste navegador.");
    }
  }
}

/* ====== Navigation ====== */
openFavBtn.addEventListener("click", () => {
  homeSection.style.display = "none";
  favoritesSection.style.display = "block";
  historySection.style.display = "none";
  renderFavorites();
});
backFromFav.addEventListener("click", () => {
  favoritesSection.style.display = "none";
  homeSection.style.display = "block";
});
clearFav.addEventListener("click", () => {
  if (confirm("Apagar todos os favoritos?")) {
    save("gv_favorites", []);
    renderFavorites();
  }
});

openHistBtn.addEventListener("click", () => {
  homeSection.style.display = "none";
  favoritesSection.style.display = "none";
  historySection.style.display = "block";
  renderHistory();
});
backFromHist.addEventListener("click", () => {
  historySection.style.display = "none";
  homeSection.style.display = "block";
});
clearHist.addEventListener("click", () => {
  if (confirm("Apagar histórico?")) {
    save("gv_history", []);
    renderHistory();
  }
});

/* ====== List interactions (event delegation) ====== */
favList.addEventListener("click", async (e) => {
  const ref = e.target.getAttribute("data-ref");
  const del = e.target.getAttribute("data-del");
  if (ref) {
    // share favorite
    const item = getFavorites().find((v) => v.ref === ref);
    if (item) {
      state.current = item;
      await shareCurrent();
    }
  }
  if (del) {
    let favs = getFavorites();
    favs = favs.filter((v) => v.ref !== del);
    save("gv_favorites", favs);
    renderFavorites();
  }
});

histList.addEventListener("click", (e) => {
  const ref = e.target.getAttribute("data-ref");
  if (ref) {
    const item = getHistory()
      .reverse()
      .find((v) => v.ref === ref);
    if (item) {
      state.current = item;
      homeSection.style.display = "block";
      favoritesSection.style.display = "none";
      historySection.style.display = "none";
      renderCurrent();
    }
  }
});

/* ====== Buttons ====== */
generateBtn.addEventListener("click", generateRandom);
favBtn.addEventListener("click", toggleFavorite);
shareBtn.addEventListener("click", shareCurrent);

/* ====== Dark mode + Install prompt ====== */
const darkToggle = document.getElementById("darkToggle");
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Install prompt handling
let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = "none";
});

/* ====== Init ====== */
(function init() {
  // Load last shown verse from history if exists
  const hist = getHistory();
  if (hist.length > 0) {
    state.current = hist[hist.length - 1];
  } else {
    state.current = FALLBACK_VERSES[0];
  }
  renderCurrent();

  // Try to fetch a fresh verse on first load (non-blocking)
  // For demo, usamos fallback random. Se quiser integração com API por referência, implementar aqui.

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("SW registrado"))
      .catch(() => console.log("SW falhou"));
  }
})();


const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente sair?")) {
    localStorage.clear();
    location.reload();
  }
});

