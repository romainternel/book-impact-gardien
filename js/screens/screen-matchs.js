/*
 * Écran Matchs — CRUD match (saison, journée, deux équipes). Maquette :
 * docs/design/mode-match.md — Écran Matchs. `getMatchs()` embed les noms
 * d'équipes désambiguïsés (cf. docs/arch/mode-match.md §4) — aucune
 * adaptation nécessaire ici, la fonction api.js gère déjà la double FK.
 */

const JOURNEES = Array.from({ length: 22 }, function(_, i){ return "J" + String(i + 1).padStart(2, "0"); });

let _matchsScreen = { status: "loading", matchs: [], equipes: [], creating: false };

function renderScreenMatchs(){
  const header = renderAppHeader("Matchs", { back: "parametres" });
  return `<div class="screen-matchs">${header}<div id="matchs-list-body"></div></div>`;
}

function renderMatchRow(m){
  const eqA = m.equipe_a ? m.equipe_a.nom : "?";
  const eqB = m.equipe_b ? m.equipe_b.nom : "?";
  return `<div class="list-card match-row">
    <span class="match-row-top">${escapeHtml(m.journee)} · ${escapeHtml(m.saison)}</span>
    <span class="match-row-teams">${escapeHtml(eqA)} vs ${escapeHtml(eqB)}</span>
  </div>`;
}

function renderCreateMatchForm(s){
  const options = s.equipes.map(function(e){ return `<option value="${escapeHtml(e.id)}">${escapeHtml(e.nom)}</option>`; }).join("");
  return `<div class="inline-create-match">
    <input type="text" id="new-match-saison" placeholder="Saison (ex. 2025-2026)">
    <select id="new-match-journee">${JOURNEES.map(function(j){ return `<option value="${j}">${j}</option>`; }).join("")}</select>
    <select id="new-match-equipe-a"><option value="">Équipe A</option>${options}</select>
    <select id="new-match-equipe-b"><option value="">Équipe B</option>${options}</select>
    <p class="form-error" id="match-form-error"></p>
    <button class="btn-primary" data-action="confirm-create-match">Créer</button>
  </div>`;
}

// Affiche l'erreur de validation/écriture SANS re-rendre le formulaire —
// un refreshMatchsListBody() complet réinitialiserait les champs déjà
// saisis (bug trouvé et corrigé pendant le développement de cette story).
function showMatchFormError(message){
  const el = document.getElementById("match-form-error");
  if(el) el.textContent = message;
}

function renderMatchsListBody(){
  const s = _matchsScreen;

  if(s.status === "loading"){
    return `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }
  if(s.status === "error"){
    return `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-matchs">Réessayer</button></div>`;
  }

  const rows = s.matchs.map(renderMatchRow).join("");
  const emptyHint = s.matchs.length === 0 ? `<p class="empty-hint">Aucun match créé</p>` : "";
  const createBlock = s.creating
    ? renderCreateMatchForm(s)
    : `<button class="list-card list-card-ghost" data-action="start-create-match">+ Nouveau match</button>`;

  return `${rows}${emptyHint}${createBlock}`;
}

function refreshMatchsListBody(){
  document.getElementById("matchs-list-body").innerHTML = renderMatchsListBody();
  bindMatchsListBody();
}

function bindMatchsListBody(){
  const startCreate = document.querySelector('[data-action="start-create-match"]');
  if(startCreate){
    startCreate.addEventListener("click", function(){
      _matchsScreen.creating = true;
      refreshMatchsListBody();
    });
  }

  const confirmCreate = document.querySelector('[data-action="confirm-create-match"]');
  if(confirmCreate){
    confirmCreate.addEventListener("click", async function(){
      const saison = (document.getElementById("new-match-saison").value || "").trim();
      const journee = document.getElementById("new-match-journee").value;
      const equipeAId = document.getElementById("new-match-equipe-a").value;
      const equipeBId = document.getElementById("new-match-equipe-b").value;

      if(!saison || !equipeAId || !equipeBId){
        showMatchFormError("Renseigne la saison et les deux équipes.");
        return;
      }
      if(equipeAId === equipeBId){
        showMatchFormError("Choisis deux équipes différentes.");
        return;
      }

      try{
        const match = await createMatch({ saison: saison, journee: journee, equipe_a_id: equipeAId, equipe_b_id: equipeBId });
        match.equipe_a = _matchsScreen.equipes.find(function(e){ return e.id === equipeAId; });
        match.equipe_b = _matchsScreen.equipes.find(function(e){ return e.id === equipeBId; });
        _matchsScreen.matchs.unshift(match);
        _matchsScreen.creating = false;
        refreshMatchsListBody();
      }catch(e){
        showMatchFormError("Échec de la création — vérifie les équipes choisies.");
      }
    });
  }

  const retry = document.querySelector('[data-action="retry-matchs"]');
  if(retry) retry.addEventListener("click", loadMatchs);
}

async function loadMatchs(){
  _matchsScreen.status = "loading";
  refreshMatchsListBody();
  try{
    const [matchs, equipes] = await Promise.all([getMatchs(), getEquipes()]);
    _matchsScreen.matchs = matchs;
    _matchsScreen.equipes = equipes;
    _matchsScreen.status = "ready";
    refreshMatchsListBody();
  }catch(e){
    _matchsScreen.status = "error";
    refreshMatchsListBody();
  }
}

function onMountScreenMatchs(){
  _matchsScreen = { status: "loading", matchs: [], equipes: [], creating: false };
  bindAppHeader();
  loadMatchs();
}

registerScreen("matchs", renderScreenMatchs, onMountScreenMatchs);
