/*
 * Écran 2 — Sélection / création tireur. Maquette : docs/design/book-impact-gardien.md
 * Écran 2. Recherche debouncée côté serveur ; par défaut (recherche vide),
 * affiche les tireurs les plus récemment consultés par ce gardien
 * (getTireursRecents, dérivé de impacts — cf. docs/architecture.md §4).
 *
 * POSTES et le formulaire de création sont partagés avec screen-joueurs.js
 * (mode Match) via tireur-form-shared.js — cf. docs/arch/mode-match.md §6.
 */

let _tireurScreen = { status: "loading", tireurs: [], query: "", creating: false, editingId: null, saveError: "" };
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
  return `<div class="list-card-row">
    <button class="list-card tireur-row" data-action="select-tireur" data-id="${escapeHtml(t.id)}">
      <span class="tireur-row-top"><span class="tireur-nom">${escapeHtml(t.nom)}</span>${lat}</span>
      ${meta ? `<span class="tireur-meta">${escapeHtml(meta)}</span>` : ""}
    </button>
    <button class="list-card-edit-btn" data-action="edit-tireur" data-id="${escapeHtml(t.id)}" title="Modifier">✏️</button>
    <button class="list-card-delete-btn" data-action="delete-tireur" data-id="${escapeHtml(t.id)}" data-nom="${escapeHtml(t.nom)}" title="Supprimer">🗑</button>
  </div>`;
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
    return renderCreateTireurForm({ initial: { nom: s.query.trim() }, submitLabel: "Créer et commencer" });
  }
  if(s.editingId){
    const tireur = s.tireurs.find(function(t){ return t.id === s.editingId; });
    const form = renderCreateTireurForm({
      initial: tireur,
      submitLabel: "Enregistrer",
      submitAction: "confirm-edit-tireur",
      cancelAction: "cancel-edit-tireur"
    });
    const err = s.saveError ? `<p class="form-error">${escapeHtml(s.saveError)}</p>` : "";
    return `${form}${err}`;
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
      renderScreen("book");
    });
  });

  document.querySelectorAll('[data-action="delete-tireur"]').forEach(function(btn){
    btn.addEventListener("click", async function(evt){
      evt.stopPropagation();
      await confirmAndDelete(btn.dataset.id, btn.dataset.nom, deleteTireur, function(){
        _tireurScreen.tireurs = _tireurScreen.tireurs.filter(function(t){ return t.id !== btn.dataset.id; });
        refreshTireurListBody();
      });
    });
  });

  document.querySelectorAll('[data-action="edit-tireur"]').forEach(function(btn){
    btn.addEventListener("click", function(evt){
      evt.stopPropagation();
      _tireurScreen.editingId = btn.dataset.id;
      _tireurScreen.saveError = "";
      refreshTireurListBody();
    });
  });

  const cancelEdit = document.querySelector('[data-action="cancel-edit-tireur"]');
  if(cancelEdit){
    cancelEdit.addEventListener("click", function(){
      _tireurScreen.editingId = null;
      _tireurScreen.saveError = "";
      refreshTireurListBody();
    });
  }

  const confirmEdit = document.querySelector('[data-action="confirm-edit-tireur"]');
  if(confirmEdit){
    confirmEdit.addEventListener("click", async function(){
      const fields = readTireurFormFields();
      if(!fields.nom) return;
      try{
        const updated = await updateTireur(_tireurScreen.editingId, fields);
        const idx = _tireurScreen.tireurs.findIndex(function(t){ return t.id === updated.id; });
        if(idx !== -1) _tireurScreen.tireurs[idx] = updated;
        _tireurScreen.editingId = null;
        _tireurScreen.saveError = "";
        refreshTireurListBody();
      }catch(e){
        _tireurScreen.saveError = "Échec de l'enregistrement — réessaie.";
        refreshTireurListBody();
      }
    });
  }

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
      const fields = readTireurFormFields();
      if(!fields.nom) return;
      try{
        const tireur = await createTireur(fields);
        state.tireurCourant = tireur;
        renderScreen("book");
      }catch(e){
        _tireurScreen.status = "error";
        refreshTireurListBody();
      }
    });
  }

  bindLatToggle();

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
  _tireurScreen = { status: "loading", tireurs: [], query: "", creating: false, editingId: null, saveError: "" };
  const input = document.getElementById("search-tireur");
  input.addEventListener("input", function(){
    _tireurScreen.query = input.value;
    _tireurScreen.creating = false;
    _tireurScreen.editingId = null;
    clearTimeout(_tireurSearchDebounce);
    _tireurSearchDebounce = setTimeout(runTireurSearch, 200);
  });
  bindAppHeader();
  loadTireurRecents();
}

registerScreen("tireur", renderScreenTireur, onMountScreenTireur);
