/*
 * Écran "Book — Équipes" — nouveau point d'entrée de "Book par tireur"
 * (STORY-19, docs/arch/book-par-equipe.md §3.1). Remplace l'ancienne
 * recherche à plat comme écran de démarrage ; la recherche existante
 * (screen-tireur.js) reste accessible via "🔍 Rechercher un tireur" et
 * reste le seul chemin vers les tireurs libres (equipe_id null).
 */

let _bookEquipesScreen = { status: "loading", equipes: [], recents: [] };

function renderScreenBookEquipes(){
  const s = _bookEquipesScreen;
  const header = renderAppHeader(state.gardienNom || "Gardien", { back: "accueil" });

  let body;
  if(s.status === "loading"){
    body = `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }else if(s.status === "error"){
    body = `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-book-equipes">Réessayer</button></div>`;
  }else{
    const recentsBlock = s.recents.length > 0
      ? `<div class="section-label">Récemment consultés</div>
         <div class="book-recents">${s.recents.map(renderBookRecentRow).join("")}</div>`
      : "";

    const equipesBody = s.equipes.length > 0
      ? s.equipes.map(function(e){
          return `<button class="list-card" data-action="select-book-equipe" data-id="${escapeHtml(e.id)}">${escapeHtml(e.nom)}</button>`;
        }).join("")
      : `<p class="empty-hint">Aucune équipe — crée-en une dans Paramètres</p>`;

    body = `
      ${recentsBlock}
      <button class="list-card list-card-nav" data-action="go-search-tireur">
        <span>🔍 Rechercher un tireur</span><span>→</span>
      </button>
      <div class="section-label">Équipes</div>
      ${equipesBody}
    `;
  }

  return `<div class="screen-book-equipes">${header}${body}</div>`;
}

function renderBookRecentRow(t){
  const meta = [t.club, posteLabel(t.poste)].filter(Boolean).join(" · ");
  const lat = t.lateralite ? `<span class="tireur-lat">●${escapeHtml(t.lateralite)}</span>` : "";
  return `<button class="list-card tireur-row" data-action="select-book-recent" data-id="${escapeHtml(t.id)}">
    <span class="tireur-row-top"><span class="tireur-nom">${escapeHtml(t.nom)}</span>${lat}</span>
    ${meta ? `<span class="tireur-meta">${escapeHtml(meta)}</span>` : ""}
  </button>`;
}

function reRenderScreenBookEquipes(){
  document.getElementById("app").innerHTML = renderScreenBookEquipes();
  bindScreenBookEquipes();
}

function bindScreenBookEquipes(){
  bindAppHeader();

  document.querySelectorAll('[data-action="select-book-recent"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const tireur = _bookEquipesScreen.recents.find(function(t){ return t.id === btn.dataset.id; });
      if(!tireur) return;
      state.tireurCourant = tireur;
      state.bookBackTarget = "book-equipes";
      renderScreen("book");
    });
  });

  const searchLink = document.querySelector('[data-action="go-search-tireur"]');
  if(searchLink){
    searchLink.addEventListener("click", function(){ renderScreen("tireur"); });
  }

  document.querySelectorAll('[data-action="select-book-equipe"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const equipe = _bookEquipesScreen.equipes.find(function(e){ return e.id === btn.dataset.id; });
      if(!equipe) return;
      state.equipeCourante = equipe;
      renderScreen("book-joueurs");
    });
  });

  const retry = document.querySelector('[data-action="retry-book-equipes"]');
  if(retry) retry.addEventListener("click", loadScreenBookEquipes);
}

async function loadScreenBookEquipes(){
  _bookEquipesScreen = { status: "loading", equipes: [], recents: [] };
  reRenderScreenBookEquipes();
  try{
    const [equipes, recents] = await Promise.all([
      getEquipes(),
      getTireursRecents(state.gardienId, 5)
    ]);
    _bookEquipesScreen = { status: "ready", equipes: equipes, recents: recents };
    reRenderScreenBookEquipes();
  }catch(e){
    _bookEquipesScreen = { status: "error", equipes: [], recents: [] };
    reRenderScreenBookEquipes();
  }
}

registerScreen("book-equipes", renderScreenBookEquipes, loadScreenBookEquipes);
