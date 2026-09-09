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
 *
 * Layout restructuré en STORY-18a (docs/arch/recentrage-match.md §2.4-2.5) :
 * ordre Résultat → Zone de cage → Zone de tir, rosters en enfants directs de
 * .screen-saisie-match (plus de wrapper .team-rosters-row) pour permettre le
 * placement en grille CSS 3 colonnes à partir de 760px. renderTeamRoster()
 * n'est pas modifiée ; le verrouillage anti double-tap passe par une classe
 * d'état sur le conteneur racine (.match-saving) plutôt que sur un wrapper
 * autour des rosters, pour rester compatible avec le placement en grille
 * (seuls les enfants directs de la grille participent au placement).
 *
 * Habillage visuel réaliste ajouté en STORY-18b (docs/arch/recentrage-match.md,
 * docs/visual/recentrage-match.md §2-3) : renderGoalZoneGrid() est enveloppée
 * dans un nouveau conteneur décoratif .goal-frame (poteaux, barre, ombre au
 * sol), appelée sans aucune modification de ses arguments. Le terrain
 * (courtSvgMarkup()/renderCourtZonePicker()) n'est pas touché ici : son
 * cadrage réaliste s'obtient entièrement en CSS sur .court-pick (marge,
 * vignette), aucun changement de markup nécessaire.
 *
 * Listing des tirs saisis + correction/suppression a posteriori (retour
 * utilisateur 2026-09-09 : la fenêtre de 4s du bandeau "Annuler" est trop
 * courte pour repérer une erreur remarquée plus tard, "ça peut être quelques
 * tireurs avant"). `impacts` n'autorise jamais l'UPDATE côté RLS (cf.
 * CLAUDE.md §5) : "modifier" est donc implémenté en insert-puis-delete (jamais
 * l'inverse, pour ne perdre aucune donnée si l'insert échoue), en réutilisant
 * les mêmes pickers que la saisie normale plutôt qu'un formulaire dédié — on
 * pré-remplit resultat/zoneTir/zoneCage/joueurId depuis l'impact visé, et la
 * sauvegarde automatique déjà en place (tryAutoSaveMatch) fait le reste dès
 * que l'utilisateur retape le champ à corriger.
 */

const MATCH_RESULTAT_OPTIONS = [
  { value: "but", label: "But" },
  { value: "non_but", label: "Non-but" }
];

let _saisieMatchScreen = {
  resultat: null, zoneTir: null, zoneCage: null, joueurId: null,
  saving: false, errorMessage: null, lastSaved: null,
  showListe: false, listeStatus: "idle", matchImpacts: [],
  editingImpactId: null, editingOriginalNom: null
};
let _confirmationTimerMatch = null;

function matchResultatLabel(resultat){
  const opt = MATCH_RESULTAT_OPTIONS.find(function(o){ return o.value === resultat; });
  return opt ? opt.label : resultat;
}

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
  const prefix = s.lastSaved.edited ? "✓ Modifié" : `✓ ${label}`;
  return `<div class="confirm-banner">
    <span>${prefix} — ${escapeHtml(s.lastSaved.joueurNom)}, ${escapeHtml(s.lastSaved.zoneTir)}${cageText}</span>
    <button class="btn-cancel-impact" data-action="annuler-dernier-impact-match">Annuler</button>
  </div>`;
}

function renderEditingBanner(){
  const s = _saisieMatchScreen;
  if(!s.editingImpactId) return "";
  return `<div class="confirm-banner">
    <span>✏️ Modification du tir de ${escapeHtml(s.editingOriginalNom || "")} — retape le(s) champ(s) à corriger</span>
    <button class="btn-cancel-impact" data-action="cancel-edit-impact-match">Annuler</button>
  </div>`;
}

function renderMatchImpactRow(impact){
  const cage = impact.zone_cage ? " → " + escapeHtml(impact.zone_cage) : "";
  const label = matchResultatLabel(impact.resultat);
  const nom = impact.tireurs ? impact.tireurs.nom : "";
  const confirmLabel = `${nom} (${label}, ${impact.zone_tir}${impact.zone_cage ? " → " + impact.zone_cage : ""})`;
  return `<div class="list-card-row">
    <div class="list-card impact-row">
      <div class="impact-row-top">
        <span class="impact-row-joueur">${escapeHtml(nom)}</span>
        <span class="badge badge-${escapeHtml(impact.resultat)}">${escapeHtml(label)}</span>
      </div>
      <span class="impact-row-zones">${escapeHtml(impact.zone_tir)}${cage}</span>
    </div>
    <button class="list-card-edit-btn" data-action="edit-impact-match" data-id="${escapeHtml(impact.id)}" title="Modifier">✏️</button>
    <button class="list-card-delete-btn" data-action="delete-impact-match" data-id="${escapeHtml(impact.id)}" data-label="${escapeHtml(confirmLabel)}" title="Supprimer">🗑</button>
  </div>`;
}

function renderImpactsListeBody(){
  const s = _saisieMatchScreen;
  if(s.listeStatus === "loading" && s.matchImpacts.length === 0){
    return `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }
  if(s.listeStatus === "error"){
    return `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-impacts-liste">Réessayer</button></div>`;
  }
  if(s.matchImpacts.length === 0){
    return `<p class="empty-hint">Aucun tir saisi pour ce match</p>`;
  }
  return s.matchImpacts.map(renderMatchImpactRow).join("");
}

function renderScreenSaisieMatch(){
  const m = state.matchCourant;
  if(!m){
    return `<div class="screen-placeholder">Aucun match sélectionné</div>`;
  }
  const s = _saisieMatchScreen;
  const listeLabel = s.showListe ? "← Saisie" : `Tirs (${s.matchImpacts.length})`;
  const header = renderAppHeader(m.journee + " · " + m.equipeA.nom + " vs " + m.equipeB.nom, {
    back: "selection-match",
    rightLink: { action: "toggle-impacts-liste", label: listeLabel }
  });

  if(s.showListe){
    return `
      <div class="screen-saisie-match">
        ${header}
        <div class="impacts-liste-wrap">
          <div class="section-label">Tirs saisis (${s.matchImpacts.length})</div>
          <div class="impacts-liste-body">${renderImpactsListeBody()}</div>
        </div>
      </div>
    `;
  }

  const resultButtons = MATCH_RESULTAT_OPTIONS.map(function(r){
    const active = s.resultat === r.value ? "active" : "";
    return `<button class="result-btn result-${r.value} ${active}" data-action="pick-resultat-match" data-resultat="${r.value}">${r.label}</button>`;
  }).join("");

  const cageLockedClass = s.resultat === "but" ? "" : "cage-locked";
  const savingClass = s.saving ? "match-saving" : "";

  return `
    <div class="screen-saisie-match ${savingClass}">
      ${header}
      ${renderTeamRoster(m.equipeA, "a")}
      <div class="saisie-match-center">
        ${renderEditingBanner()}
        <div class="impact-section">
          <div class="section-label">Résultat</div>
          <div class="result-buttons-2">${resultButtons}</div>
        </div>
        <div class="impact-section">
          <div class="section-label">Zone de cage</div>
          <div class="${cageLockedClass}">
            <div class="goal-frame">
              <div class="goal-frame-bar"></div>
              ${renderGoalZoneGrid(s.zoneCage)}
            </div>
            <div class="goal-frame-ground-shadow"></div>
          </div>
        </div>
        <div class="impact-section">
          <div class="section-label">Zone de tir</div>
          <div class="court-pick"><svg class="court-svg-bg" viewBox="0 0 350 208" id="saisie-match-court-svg">${courtSvgMarkup()}${renderCourtZonePicker(s.zoneTir)}</svg></div>
        </div>
      </div>
      ${renderTeamRoster(m.equipeB, "b")}
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

  const toggleListeBtn = document.querySelector('[data-action="toggle-impacts-liste"]');
  if(toggleListeBtn){
    toggleListeBtn.addEventListener("click", function(evt){
      evt.preventDefault();
      _saisieMatchScreen.showListe = !_saisieMatchScreen.showListe;
      refreshSaisieMatchScreen();
    });
  }

  const retryListeBtn = document.querySelector('[data-action="retry-impacts-liste"]');
  if(retryListeBtn){
    retryListeBtn.addEventListener("click", loadMatchImpacts);
  }

  const cancelEditBtn = document.querySelector('[data-action="cancel-edit-impact-match"]');
  if(cancelEditBtn){
    cancelEditBtn.addEventListener("click", function(){
      const s = _saisieMatchScreen;
      s.editingImpactId = null;
      s.editingOriginalNom = null;
      s.resultat = null;
      s.zoneTir = null;
      s.zoneCage = null;
      s.joueurId = null;
      refreshSaisieMatchScreen();
    });
  }

  document.querySelectorAll('[data-action="edit-impact-match"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const s = _saisieMatchScreen;
      const impact = s.matchImpacts.find(function(i){ return i.id === btn.dataset.id; });
      if(!impact) return;
      s.editingImpactId = impact.id;
      s.editingOriginalNom = impact.tireurs ? impact.tireurs.nom : "";
      s.resultat = impact.resultat;
      s.zoneTir = impact.zone_tir;
      s.zoneCage = impact.zone_cage;
      s.joueurId = impact.tireur_id;
      s.showListe = false;
      refreshSaisieMatchScreen();
    });
  });

  document.querySelectorAll('[data-action="delete-impact-match"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      confirmAndDelete(btn.dataset.id, btn.dataset.label, deleteImpact, function(){
        _saisieMatchScreen.matchImpacts = _saisieMatchScreen.matchImpacts.filter(function(i){ return i.id !== btn.dataset.id; });
        refreshSaisieMatchScreen();
      });
    });
  });
}

async function loadMatchImpacts(){
  const s = _saisieMatchScreen;
  s.listeStatus = "loading";
  refreshSaisieMatchScreen();
  try{
    s.matchImpacts = await getImpactsForMatch(state.matchCourant.id);
    s.listeStatus = "ready";
  }catch(e){
    s.listeStatus = "error";
  }
  refreshSaisieMatchScreen();
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
  const editingId = s.editingImpactId;
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
    // Insert d'abord, delete de l'ancien ensuite si c'est une édition : en cas
    // d'échec du delete, on garde au pire un doublon plutôt que de perdre la
    // donnée corrigée (impacts n'autorise pas l'UPDATE côté RLS, cf. CLAUDE.md §5).
    const impact = await createImpact(payload);
    if(editingId){
      try{ await deleteImpact(editingId); }catch(e){ /* doublon accepté plutôt que perte de donnée */ }
      s.matchImpacts = s.matchImpacts.filter(function(i){ return i.id !== editingId; });
    }
    s.matchImpacts.unshift(Object.assign({}, impact, { tireurs: { nom: findJoueurNom(s.joueurId) } }));
    s.lastSaved = { id: impact.id, resultat: s.resultat, zoneTir: s.zoneTir, zoneCage: s.zoneCage, joueurNom: findJoueurNom(s.joueurId), edited: !!editingId };
    s.resultat = null;
    s.zoneTir = null;
    s.zoneCage = null;
    s.joueurId = null;
    s.editingImpactId = null;
    s.editingOriginalNom = null;
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
    s.matchImpacts = s.matchImpacts.filter(function(i){ return i.id !== id; });
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
    saving: false, errorMessage: null, lastSaved: null,
    showListe: false, listeStatus: "idle", matchImpacts: [],
    editingImpactId: null, editingOriginalNom: null
  };
  if(!state.matchCourant) return;
  bindScreenSaisieMatch();
  loadMatchImpacts();
}

registerScreen("saisie-match", renderScreenSaisieMatch, onMountScreenSaisieMatch);
