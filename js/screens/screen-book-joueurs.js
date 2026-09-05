/*
 * Écran "Book — Joueurs d'une équipe" — roster en lecture seule d'une
 * équipe, tap sur un joueur → Book direct (STORY-19,
 * docs/arch/book-par-equipe.md §3.2). Distinct de screen-joueurs.js
 * (Paramètres, CRUD, lignes non cliquables) : mêmes données
 * (getJoueursByEquipe), navigation différente — pas de logique
 * conditionnelle partagée entre les deux écrans.
 */

let _bookJoueursScreen = { status: "loading", joueurs: [] };

function renderScreenBookJoueurs(){
  const eq = state.equipeCourante;
  if(!eq){
    return `<div class="screen-placeholder">Aucune équipe sélectionnée</div>`;
  }
  const header = renderAppHeader(eq.nom, { back: "book-equipes" });

  const s = _bookJoueursScreen;
  let body;
  if(s.status === "loading"){
    body = `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }else if(s.status === "error"){
    body = `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-book-joueurs">Réessayer</button></div>`;
  }else if(s.joueurs.length === 0){
    body = `<p class="empty-hint">Aucun joueur dans cette équipe</p>`;
  }else{
    body = s.joueurs.map(renderBookJoueurRow).join("");
  }

  return `<div class="screen-book-joueurs">${header}${body}</div>`;
}

function renderBookJoueurRow(j){
  const meta = posteLabel(j.poste);
  const lat = j.lateralite ? `<span class="tireur-lat">●${escapeHtml(j.lateralite)}</span>` : "";
  return `<button class="list-card tireur-row" data-action="select-book-joueur" data-id="${escapeHtml(j.id)}">
    <span class="tireur-row-top"><span class="tireur-nom">${escapeHtml(j.nom)}</span>${lat}</span>
    ${meta ? `<span class="tireur-meta">${escapeHtml(meta)}</span>` : ""}
  </button>`;
}

function reRenderScreenBookJoueurs(){
  document.getElementById("app").innerHTML = renderScreenBookJoueurs();
  bindScreenBookJoueurs();
}

function bindScreenBookJoueurs(){
  bindAppHeader();

  document.querySelectorAll('[data-action="select-book-joueur"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const joueur = _bookJoueursScreen.joueurs.find(function(j){ return j.id === btn.dataset.id; });
      if(!joueur) return;
      state.tireurCourant = joueur;
      state.bookBackTarget = "book-joueurs";
      renderScreen("book");
    });
  });

  const retry = document.querySelector('[data-action="retry-book-joueurs"]');
  if(retry) retry.addEventListener("click", loadScreenBookJoueurs);
}

async function loadScreenBookJoueurs(){
  _bookJoueursScreen = { status: "loading", joueurs: [] };
  if(!state.equipeCourante) return;
  reRenderScreenBookJoueurs();
  try{
    const joueurs = await getJoueursByEquipe(state.equipeCourante.id);
    _bookJoueursScreen = { status: "ready", joueurs: joueurs };
    reRenderScreenBookJoueurs();
  }catch(e){
    _bookJoueursScreen = { status: "error", joueurs: [] };
    reRenderScreenBookJoueurs();
  }
}

registerScreen("book-joueurs", renderScreenBookJoueurs, loadScreenBookJoueurs);
