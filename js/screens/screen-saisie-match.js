/*
 * Écran Saisie Match — boucle cœur (STORY-14a). Maquette :
 * docs/design/mode-match.md — Écran Saisie Match. Réutilise zone-picker.js
 * (terrain) et renderGoalZoneGrid (cage) tels quels, comme screen-impact.js.
 *
 * Résultat simplifié à 2 valeurs (but/non_but) — non_but se comporte comme
 * hors_cadre (pas de zone de cage requise), cf. docs/arch/mode-match.md §3.
 * Chaque impact porte match_id en plus de gardien_id/tireur_id.
 *
 * Robustesse (verrou anti double-tap, bandeau erreur/annulation) : hors
 * scope, cf. STORY-14b — même split que STORY-06a/06b.
 */

const MATCH_RESULTAT_OPTIONS = [
  { value: "but", label: "But" },
  { value: "non_but", label: "Non-but" }
];

let _saisieMatchScreen = { resultat: null, zoneTir: null, zoneCage: null, joueurId: null };

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

  return `
    <div class="screen-saisie-match">
      ${header}
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
      _saisieMatchScreen.resultat = btn.dataset.resultat;
      if(_saisieMatchScreen.resultat !== "but") _saisieMatchScreen.zoneCage = null;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  });

  const svg = document.getElementById("saisie-match-court-svg");
  if(svg){
    bindCourtZonePicker(svg, function(zone){
      _saisieMatchScreen.zoneTir = zone;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  }

  document.querySelectorAll("[data-gz]").forEach(function(cell){
    cell.addEventListener("click", function(){
      _saisieMatchScreen.zoneCage = cell.dataset.gz;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  });

  document.querySelectorAll('[data-action="pick-joueur"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      _saisieMatchScreen.joueurId = btn.dataset.id;
      refreshSaisieMatchScreen();
      tryAutoSaveMatch();
    });
  });
}

function tryAutoSaveMatch(){
  const s = _saisieMatchScreen;
  if(!s.resultat || !s.zoneTir || !s.joueurId) return;
  if(s.resultat === "but" && !s.zoneCage) return;
  saveMatchImpact();
}

async function saveMatchImpact(){
  const s = _saisieMatchScreen;
  const m = state.matchCourant;
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
    await createImpact(payload);
    _saisieMatchScreen.resultat = null;
    _saisieMatchScreen.zoneTir = null;
    _saisieMatchScreen.zoneCage = null;
    _saisieMatchScreen.joueurId = null;
    refreshSaisieMatchScreen();
  }catch(e){
    // Bandeau d'erreur explicite + conservation de la sélection : STORY-14b
    // (même split que STORY-06a/06b).
    console.error("Échec de l'enregistrement de l'impact match", e);
  }
}

function onMountScreenSaisieMatch(){
  _saisieMatchScreen = { resultat: null, zoneTir: null, zoneCage: null, joueurId: null };
  if(!state.matchCourant) return;
  bindScreenSaisieMatch();
}

registerScreen("saisie-match", renderScreenSaisieMatch, onMountScreenSaisieMatch);
