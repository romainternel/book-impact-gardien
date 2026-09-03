/*
 * Écran Saisie Match. Boucle cœur posée en STORY-14a (maquette :
 * docs/design/mode-match.md — Écran Saisie Match). Robustesse ajoutée en
 * STORY-14b, réplique exacte du pattern déjà validé sur screen-impact.js
 * (STORY-06b), mitigation du risque #2 de docs/risks/mode-match.md :
 *  - verrouillage anti double-tap pendant l'écriture (s.saving)
 *  - bandeau d'erreur explicite qui NE réinitialise PAS la sélection
 *  - bandeau de confirmation + bouton "Annuler" (supprime réellement l'impact)
 *
 * Résultat simplifié à 2 valeurs (but/non_but) — non_but se comporte comme
 * hors_cadre (pas de zone de cage requise), cf. docs/arch/mode-match.md §3.
 * Chaque impact porte match_id en plus de gardien_id/tireur_id.
 */

const MATCH_RESULTAT_OPTIONS = [
  { value: "but", label: "But" },
  { value: "non_but", label: "Non-but" }
];

let _saisieMatchScreen = {
  resultat: null, zoneTir: null, zoneCage: null, joueurId: null,
  saving: false, errorMessage: null, lastSaved: null
};
let _confirmationTimerMatch = null;

function findJoueurNom(joueurId){
  const m = state.matchCourant;
  if(!m) return "";
  const all = m.equipeA.joueurs.concat(m.equipeB.joueurs);
  const j = all.find(function(j){ return j.id === joueurId; });
  return j ? j.nom : "";
}

function renderTeamRoster(team, side){
  const joueurs = team.joueurs.map(function(j){
    const active = _saisieMatchScreen.joueurId === j.id ? "active" : "";
    return `<button class="player-btn ${active}" data-action="pick-joueur" data-id="${escapeHtml(j.id)}">${escapeHtml(j.nom)}</button>`;
  }).join("");
  const emptyMsg = team.joueurs.length === 0 ? `<p class="empty-hint">Aucun joueur</p>` : "";
  return `<div class="team-roster team-roster-${side}">
    <div class="team-roster-label">${escapeHtml(team.nom)}</div>
    ${joueurs}${emptyMsg}
  </div>`;
}

function renderMatchConfirmationBanner(){
  const s = _saisieMatchScreen;
  if(s.errorMessage){
    return `<div class="confirm-banner confirm-banner-error">
      <span>${escapeHtml(s.errorMessage)}</span>
      <button class="btn-cancel-impact" data-action="retry-save-match">Réessayer</button>
    </div>`;
  }
  if(!s.lastSaved) return "";
  if(s.lastSaved.cancelled){
    return `<div class="confirm-banner confirm-banner-cancel"><span>Impact annulé</span></div>`;
  }
  const cageText = s.lastSaved.zoneCage ? ` → ${escapeHtml(s.lastSaved.zoneCage)}` : "";
  const label = s.lastSaved.resultat === "but" ? "But" : "Non-but";
  return `<div class="confirm-banner">
    <span>✓ ${label} — ${escapeHtml(s.lastSaved.joueurNom)}, ${escapeHtml(s.lastSaved.zoneTir)}${cageText}</span>
    <button class="btn-cancel-impact" data-action="annuler-dernier-impact-match">Annuler</button>
  </div>`;
}

function renderScreenSaisieMatch(){
  const m = state.matchCourant;
  if(!m){
    return `<div class="screen-placeholder">Aucun match sélectionné</div>`;
  }
  const s = _saisieMatchScreen;
  const header = renderAppHeader(m.journee + " · " + m.equipeA.nom + " vs " + m.equipeB.nom, { back: "selection-match" });

  const resultButtons = MATCH_RESULTAT_OPTIONS.map(function(r){
    const active = s.resultat === r.value ? "active" : "";
    return `<button class="result-btn result-${r.value} ${active}" data-action="pick-resultat-match" data-resultat="${r.value}">${r.label}</button>`;
  }).join("");

  const cageLockedClass = s.resultat === "but" ? "" : "cage-locked";
  const inputLockedClass = s.saving ? "impact-locked" : "";

  return `
    <div class="screen-saisie-match">
      ${header}
      <div class="${inputLockedClass}">
        <div class="impact-section">
          <div class="section-label">Résultat</div>
          <div class="result-buttons-2">${resultButtons}</div>
        </div>
        <div class="impact-section">
          <div class="section-label">Zone de tir</div>
          <div class="court-pick"><svg class="court-svg-bg" viewBox="0 0 350 208" id="saisie-match-court-svg">${courtSvgMarkup()}${renderCourtZonePicker(s.zoneTir)}</svg></div>
        </div>
        <div class="impact-section">
          <div class="section-label">Zone de cage</div>
          <div class="${cageLockedClass}">${renderGoalZoneGrid(s.zoneCage)}</div>
        </div>
        <div class="impact-section">
          <div class="section-label">Qui a tiré ?</div>
          <div class="team-rosters-row">
            ${renderTeamRoster(m.equipeA, "a")}
            ${renderTeamRoster(m.equipeB, "b")}
          </div>
        </div>
      </div>
      ${renderMatchConfirmationBanner()}
    </div>
  `;
}

function refreshSaisieMatchScreen(){
  document.getElementById("app").innerHTML = renderScreenSaisieMatch();
  bindScreenSaisieMatch();
}

function bindScreenSaisieMatch(){
  bindAppHeader();

  document.querySelectorAll('[data-action="pick-resultat-match"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      if(_saisieMatchScreen.saving) return;
      _saisieMatchScreen.resultat = btn.dataset.resultat;
      if(_saisieMatchScreen.resultat !== "but") _saisieMatchScreen.zoneCage = null;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  });

  const svg = document.getElementById("saisie-match-court-svg");
  if(svg){
    bindCourtZonePicker(svg, function(zone){
      if(_saisieMatchScreen.saving) return;
      _saisieMatchScreen.zoneTir = zone;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  }

  document.querySelectorAll("[data-gz]").forEach(function(cell){
    cell.addEventListener("click", function(){
      if(_saisieMatchScreen.saving) return;
      _saisieMatchScreen.zoneCage = cell.dataset.gz;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  });

  document.querySelectorAll('[data-action="pick-joueur"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      if(_saisieMatchScreen.saving) return;
      _saisieMatchScreen.joueurId = btn.dataset.id;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  });

  const retryBtn = document.querySelector('[data-action="retry-save-match"]');
  if(retryBtn){
    retryBtn.addEventListener("click", function(){
      _saisieMatchScreen.errorMessage = null;
      saveMatchImpact();
    });
  }

  const cancelBtn = document.querySelector('[data-action="annuler-dernier-impact-match"]');
  if(cancelBtn){
    cancelBtn.addEventListener("click", handleAnnulerDernierImpactMatch);
  }
}

function tryAutoSaveMatch(){
  const s = _saisieMatchScreen;
  if(s.saving) return;
  if(!s.resultat || !s.zoneTir || !s.joueurId) return;
  if(s.resultat === "but" && !s.zoneCage) return;
  saveMatchImpact();
}

async function saveMatchImpact(){
  const s = _saisieMatchScreen;
  const m = state.matchCourant;
  s.saving = true;
  s.errorMessage = null;
  refreshSaisieMatchScreen();

  const payload = {
    gardien_id: state.gardienId,
    tireur_id: s.joueurId,
    match_id: m.id,
    zone_tir: s.zoneTir,
    resultat: s.resultat,
    zone_cage: s.resultat === "but" ? s.zoneCage : null,
    type_tir: null,
    main: null
  };

  try{
    const impact = await createImpact(payload);
    s.lastSaved = { id: impact.id, resultat: s.resultat, zoneTir: s.zoneTir, zoneCage: s.zoneCage, joueurNom: findJoueurNom(s.joueurId) };
    s.resultat = null;
    s.zoneTir = null;
    s.zoneCage = null;
    s.joueurId = null;
    s.saving = false;
    refreshSaisieMatchScreen();
    scheduleConfirmationDismissMatch(4000);
  }catch(e){
    s.saving = false;
    s.errorMessage = "Échec de l'enregistrement — réessaie";
    refreshSaisieMatchScreen();
  }
}

async function handleAnnulerDernierImpactMatch(){
  const s = _saisieMatchScreen;
  if(!s.lastSaved || s.lastSaved.cancelled) return;
  const id = s.lastSaved.id;
  try{
    await deleteImpact(id);
    s.lastSaved = { cancelled: true };
    refreshSaisieMatchScreen();
    scheduleConfirmationDismissMatch(2000);
  }catch(e){
    // Échec de la suppression elle-même : le bandeau reste tel quel.
  }
}

function scheduleConfirmationDismissMatch(delayMs){
  clearTimeout(_confirmationTimerMatch);
  _confirmationTimerMatch = setTimeout(function(){
    _saisieMatchScreen.lastSaved = null;
    refreshSaisieMatchScreen();
  }, delayMs);
}

function onMountScreenSaisieMatch(){
  clearTimeout(_confirmationTimerMatch);
  _saisieMatchScreen = {
    resultat: null, zoneTir: null, zoneCage: null, joueurId: null,
    saving: false, errorMessage: null, lastSaved: null
  };
  if(!state.matchCourant) return;
  bindScreenSaisieMatch();
}

registerScreen("saisie-match", renderScreenSaisieMatch, onMountScreenSaisieMatch);
