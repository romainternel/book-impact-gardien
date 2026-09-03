/*
 * Écran 2 — Sélection / création tireur. Maquette : docs/design/book-impact-gardien.md
 * Écran 2. Recherche debouncée côté serveur ; par défaut (recherche vide),
 * affiche les tireurs les plus récemment consultés par ce gardien
 * (getTireursRecents, dérivé de impacts — cf. docs/architecture.md §4).
 */

const POSTES = [
  { value: "ailier_d", label: "Ailier D" },
  { value: "ailier_g", label: "Ailier G" },
  { value: "arriere_d", label: "Arrière D" },
  { value: "arriere_g", label: "Arrière G" },
  { value: "demi_centre", label: "Demi-centre" },
  { value: "pivot", label: "Pivot" }
];

function posteLabel(value){
  const p = POSTES.find(function(p){ return p.value === value; });
  return p ? p.label : "";
}

let _tireurScreen = { status: "loading", tireurs: [], query: "", creating: false };
let _tireurSearchDebounce = null;

function renderScreenTireur(){
  return `
    <div class="screen-tireur">
      ${renderAppHeader(state.gardienNom || "Gardien", { back: "accueil" })}
      <input type="text" id="search-tireur" class="search-input" placeholder="Chercher un tireur..." autocomplete="off">
      <div id="tireur-list-body"></div>
    </div>
  `;
}

function renderTireurRow(t){
  const meta = [t.club, posteLabel(t.poste)].filter(Boolean).join(" · ");
  const lat = t.lateralite ? `<span class="tireur-lat">●${escapeHtml(t.lateralite)}</span>` : "";
  return `<button class="list-card tireur-row" data-action="select-tireur" data-id="${escapeHtml(t.id)}">
    <span class="tireur-row-top"><span class="tireur-nom">${escapeHtml(t.nom)}</span>${lat}</span>
    ${meta ? `<span class="tireur-meta">${escapeHtml(meta)}</span>` : ""}
  </button>`;
}

function renderTireurListBody(){
  const s = _tireurScreen;

  if(s.status === "loading"){
    return `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }
  if(s.status === "error"){
    return `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-tireur">Réessayer</button></div>`;
  }
  if(s.creating){
    return `<div class="inline-create-tireur">
      <input type="text" id="new-tireur-nom" placeholder="Nom *" value="${escapeHtml(s.query.trim())}">
      <input type="text" id="new-tireur-club" placeholder="Club">
      <select id="new-tireur-poste">
        <option value="">Poste (optionnel)</option>
        ${POSTES.map(function(p){ return `<option value="${p.value}">${p.label}</option>`; }).join("")}
      </select>
      <div class="lat-toggle">
        <button type="button" class="lat-btn" data-action="pick-lat" data-lat="D">D</button>
        <button type="button" class="lat-btn" data-action="pick-lat" data-lat="G">G</button>
      </div>
      <button class="btn-primary" data-action="confirm-create-tireur">Créer et commencer</button>
    </div>`;
  }

  const query = s.query.trim();
  const rows = s.tireurs.map(renderTireurRow).join("");
  const hasExactMatch = s.tireurs.some(function(t){ return t.nom.trim().toLowerCase() === query.toLowerCase(); });
  const createRow = (query && !hasExactMatch)
    ? `<button class="list-card list-card-ghost" data-action="start-create-tireur">+ Créer "${escapeHtml(query)}"</button>`
    : "";
  const emptyHint = (!query && s.tireurs.length === 0)
    ? `<p class="empty-hint">Aucun tireur consulté récemment</p>`
    : "";

  return `${rows}${emptyHint}${createRow}`;
}

function refreshTireurListBody(){
  document.getElementById("tireur-list-body").innerHTML = renderTireurListBody();
  bindTireurListBody();
}

function bindTireurListBody(){
  document.querySelectorAll('[data-action="select-tireur"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const tireur = _tireurScreen.tireurs.find(function(t){ return t.id === btn.dataset.id; });
      if(!tireur) return;
      state.tireurCourant = tireur;
      renderScreen("impact");
    });
  });

  const startCreate = document.querySelector('[data-action="start-create-tireur"]');
  if(startCreate){
    startCreate.addEventListener("click", function(){
      _tireurScreen.creating = true;
      refreshTireurListBody();
    });
  }

  const confirmCreate = document.querySelector('[data-action="confirm-create-tireur"]');
  if(confirmCreate){
    confirmCreate.addEventListener("click", async function(){
      const nomInput = document.getElementById("new-tireur-nom");
      const nom = (nomInput.value || "").trim();
      if(!nom) return;
      const club = (document.getElementById("new-tireur-club").value || "").trim();
      const poste = document.getElementById("new-tireur-poste").value;
      const latBtn = document.querySelector(".lat-btn.active");
      const lateralite = latBtn ? latBtn.dataset.lat : "";
      try{
        const tireur = await createTireur({ nom: nom, club: club, poste: poste, lateralite: lateralite });
        state.tireurCourant = tireur;
        renderScreen("impact");
      }catch(e){
        _tireurScreen.status = "error";
        refreshTireurListBody();
      }
    });
  }

  document.querySelectorAll('[data-action="pick-lat"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      document.querySelectorAll(".lat-btn").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });

  const retry = document.querySelector('[data-action="retry-tireur"]');
  if(retry) retry.addEventListener("click", loadTireurRecents);
}

async function loadTireurRecents(){
  _tireurScreen.status = "loading";
  _tireurScreen.creating = false;
  refreshTireurListBody();
  try{
    const tireurs = await getTireursRecents(state.gardienId, 5);
    _tireurScreen.tireurs = tireurs;
    _tireurScreen.status = "ready";
    refreshTireurListBody();
  }catch(e){
    _tireurScreen.status = "error";
    refreshTireurListBody();
  }
}

async function runTireurSearch(){
  const query = _tireurScreen.query.trim();
  if(!query){
    loadTireurRecents();
    return;
  }
  _tireurScreen.status = "loading";
  refreshTireurListBody();
  try{
    const tireurs = await searchTireurs(query);
    _tireurScreen.tireurs = tireurs;
    _tireurScreen.status = "ready";
    refreshTireurListBody();
  }catch(e){
    _tireurScreen.status = "error";
    refreshTireurListBody();
  }
}

function onMountScreenTireur(){
  _tireurScreen = { status: "loading", tireurs: [], query: "", creating: false };
  const input = document.getElementById("search-tireur");
  input.addEventListener("input", function(){
    _tireurScreen.query = input.value;
    _tireurScreen.creating = false;
    clearTimeout(_tireurSearchDebounce);
    _tireurSearchDebounce = setTimeout(runTireurSearch, 200);
  });
  bindAppHeader();
  loadTireurRecents();
}

registerScreen("tireur", renderScreenTireur, onMountScreenTireur);
