/*
 * Écran Sélection Match — point d'entrée du mode Saisie match. Maquette :
 * docs/design/mode-match.md — Écran Sélection Match. Au clic "Lancer",
 * state.matchCourant est peuplé avec les deux équipes ET leurs joueurs déjà
 * résolus (getJoueursByEquipe pour les deux côtés) — l'écran de saisie
 * (STORY-14a) n'a plus aucun chargement à faire à son montage.
 */

let _selectionMatchScreen = { status: "loading", matchs: [] };

function renderScreenSelectionMatch(){
  const header = renderAppHeader("Choisis ton match", { back: "accueil" });

  const s = _selectionMatchScreen;
  let body;
  if(s.status === "loading"){
    body = `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }else if(s.status === "error"){
    body = `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-selection-match">Réessayer</button></div>`;
  }else if(s.matchs.length === 0){
    body = `<div class="empty-state">
      <p>Aucun match créé pour l'instant</p>
      <button class="btn-secondary" data-action="go-create-match">Créer un match</button>
    </div>`;
  }else{
    body = s.matchs.map(function(m){
      const eqA = m.equipe_a ? m.equipe_a.nom : "?";
      const eqB = m.equipe_b ? m.equipe_b.nom : "?";
      return `<div class="list-card match-row match-row-launch">
        <span class="match-row-top">${escapeHtml(m.journee)} · ${escapeHtml(m.saison)}</span>
        <span class="match-row-teams">${escapeHtml(eqA)} vs ${escapeHtml(eqB)}</span>
        <button class="btn-primary match-launch-btn" data-action="launch-match" data-id="${escapeHtml(m.id)}">Lancer</button>
      </div>`;
    }).join("");
  }

  return `<div class="screen-selection-match">${header}${body}</div>`;
}

function bindScreenSelectionMatch(){
  bindAppHeader();

  const retry = document.querySelector('[data-action="retry-selection-match"]');
  if(retry) retry.addEventListener("click", loadSelectionMatch);

  const goCreate = document.querySelector('[data-action="go-create-match"]');
  if(goCreate) goCreate.addEventListener("click", function(){ renderScreen("matchs"); });

  document.querySelectorAll('[data-action="launch-match"]').forEach(function(btn){
    btn.addEventListener("click", async function(){
      const match = _selectionMatchScreen.matchs.find(function(m){ return m.id === btn.dataset.id; });
      if(!match) return;
      btn.disabled = true;
      btn.textContent = "…";
      try{
        const [joueursA, joueursB] = await Promise.all([
          getJoueursByEquipe(match.equipe_a.id),
          getJoueursByEquipe(match.equipe_b.id)
        ]);
        state.matchCourant = {
          id: match.id,
          saison: match.saison,
          journee: match.journee,
          equipeA: Object.assign({}, match.equipe_a, { joueurs: joueursA }),
          equipeB: Object.assign({}, match.equipe_b, { joueurs: joueursB })
        };
        renderScreen("saisie-match");
      }catch(e){
        btn.disabled = false;
        btn.textContent = "Lancer";
      }
    });
  });
}

async function loadSelectionMatch(){
  _selectionMatchScreen = { status: "loading", matchs: [] };
  document.getElementById("app").innerHTML = renderScreenSelectionMatch();
  bindScreenSelectionMatch();
  try{
    const matchs = await getMatchs();
    _selectionMatchScreen = { status: "ready", matchs: matchs };
    document.getElementById("app").innerHTML = renderScreenSelectionMatch();
    bindScreenSelectionMatch();
  }catch(e){
    _selectionMatchScreen = { status: "error", matchs: [] };
    document.getElementById("app").innerHTML = renderScreenSelectionMatch();
    bindScreenSelectionMatch();
  }
}

registerScreen("selection-match", renderScreenSelectionMatch, loadSelectionMatch);
