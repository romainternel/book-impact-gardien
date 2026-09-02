/*
 * Écran 3 — Saisie impact. Boucle cœur posée en STORY-06a (maquette et
 * logique d'enchaînement : docs/design/book-impact-gardien.md Écran 3).
 * Robustesse ajoutée en STORY-06b (mitigations P0-#1/P1-#2 de
 * docs/risks/book-impact-gardien.md) :
 *  - verrouillage anti double-tap pendant l'écriture (s.saving)
 *  - bandeau d'erreur explicite qui NE réinitialise PAS la sélection
 *  - bandeau de confirmation + bouton "Annuler" (supprime réellement l'impact)
 */

const TYPE_TIR_OPTIONS = [
  { value: "jet", label: "Jet" },
  { value: "appui", label: "Appui" },
  { value: "suspension", label: "Suspension" },
  { value: "extension", label: "Extension" },
  { value: "penalty", label: "Penalty" }
];

const RESULTAT_OPTIONS = [
  { value: "but", label: "But" },
  { value: "arret", label: "Arrêt" },
  { value: "poteau", label: "Poteau" },
  { value: "hors_cadre", label: "Hors cadre" }
];

function isResultatCadre(resultat){
  return resultat === "but" || resultat === "arret" || resultat === "poteau";
}

function resultatLabel(value){
  const o = RESULTAT_OPTIONS.find(function(o){ return o.value === value; });
  return o ? o.label : value;
}

let _impactScreen = {
  resultat: null, zoneTir: null, zoneCage: null, typeTir: null, main: null,
  saving: false, errorMessage: null, lastSaved: null
};
let _confirmationTimer = null;

function renderScreenImpact(){
  const t = state.tireurCourant;
  if(!t){
    return `<div class="screen-placeholder">Aucun tireur sélectionné</div>`;
  }
  const s = _impactScreen;
  const header = renderAppHeader(
    t.nom + (t.club ? " · " + t.club : ""),
    { back: "tireur", rightLink: { action: "open-book", label: "📖 Book" } }
  );

  const resultButtons = RESULTAT_OPTIONS.map(function(r){
    const active = s.resultat === r.value ? "active" : "";
    return `<button class="result-btn result-${r.value} ${active}" data-action="pick-resultat" data-resultat="${r.value}">${r.label}</button>`;
  }).join("");

  const cageLockedClass = isResultatCadre(s.resultat) ? "" : "cage-locked";

  const typeChips = TYPE_TIR_OPTIONS.map(function(ty){
    const active = s.typeTir === ty.value ? "active" : "";
    return `<button class="chip ${active}" data-action="pick-type" data-type="${ty.value}">${ty.label}</button>`;
  }).join("");

  const mainChips = ["D", "G"].map(function(m){
    const active = s.main === m ? "active" : "";
    return `<button class="chip ${active}" data-action="pick-main" data-main="${m}">${m}</button>`;
  }).join("");

  const inputLockedClass = s.saving ? "impact-locked" : "";

  return `
    <div class="screen-impact">
      ${header}
      <div class="${inputLockedClass}">
        <div class="impact-section">
          <div class="section-label">Résultat</div>
          <div class="result-buttons">${resultButtons}</div>
        </div>
        <div class="impact-section">
          <div class="section-label">Zone de tir</div>
          <div class="court-pick"><svg class="court-svg-bg" viewBox="0 0 350 208" id="impact-court-svg">${courtSvgMarkup()}${renderCourtZonePicker(s.zoneTir)}</svg></div>
        </div>
        <div class="impact-section">
          <div class="section-label">Zone de cage</div>
          <div class="${cageLockedClass}">${renderGoalZoneGrid(s.zoneCage)}</div>
        </div>
      </div>
      <div class="impact-section quick-selectors">
        <div class="quick-row"><span class="quick-label">Type</span><div class="chip-row">${typeChips}</div></div>
        <div class="quick-row"><span class="quick-label">Main</span><div class="chip-row">${mainChips}</div></div>
      </div>
      ${renderConfirmationBanner()}
    </div>
  `;
}

function renderConfirmationBanner(){
  const s = _impactScreen;
  if(s.errorMessage){
    return `<div class="confirm-banner confirm-banner-error">
      <span>${escapeHtml(s.errorMessage)}</span>
      <button class="btn-cancel-impact" data-action="retry-save-impact">Réessayer</button>
    </div>`;
  }
  if(!s.lastSaved) return "";
  if(s.lastSaved.cancelled){
    return `<div class="confirm-banner confirm-banner-cancel"><span>Impact annulé</span></div>`;
  }
  const cageText = s.lastSaved.zoneCage ? ` → ${escapeHtml(s.lastSaved.zoneCage)}` : "";
  return `<div class="confirm-banner">
    <span>✓ Impact enregistré — ${resultatLabel(s.lastSaved.resultat)}, ${escapeHtml(s.lastSaved.zoneTir)}${cageText}</span>
    <button class="btn-cancel-impact" data-action="annuler-dernier-impact">Annuler</button>
  </div>`;
}

function refreshImpactScreen(){
  document.getElementById("app").innerHTML = renderScreenImpact();
  bindScreenImpact();
}

function bindScreenImpact(){
  bindAppHeader();

  const bookLink = document.querySelector('[data-action="open-book"]');
  if(bookLink){
    bookLink.addEventListener("click", function(evt){
      evt.preventDefault();
      renderScreen("book");
    });
  }

  document.querySelectorAll('[data-action="pick-resultat"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      if(_impactScreen.saving) return;
      _impactScreen.resultat = btn.dataset.resultat;
      if(!isResultatCadre(_impactScreen.resultat)) _impactScreen.zoneCage = null;
      refreshImpactScreen();
      tryAutoSaveImpact();
    });
  });

  const svg = document.getElementById("impact-court-svg");
  if(svg){
    bindCourtZonePicker(svg, function(zone){
      if(_impactScreen.saving) return;
      _impactScreen.zoneTir = zone;
      refreshImpactScreen();
      tryAutoSaveImpact();
    });
  }

  document.querySelectorAll("[data-gz]").forEach(function(cell){
    cell.addEventListener("click", function(){
      if(_impactScreen.saving) return;
      _impactScreen.zoneCage = cell.dataset.gz;
      refreshImpactScreen();
      tryAutoSaveImpact();
    });
  });

  document.querySelectorAll('[data-action="pick-type"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      _impactScreen.typeTir = _impactScreen.typeTir === btn.dataset.type ? null : btn.dataset.type;
      refreshImpactScreen();
    });
  });

  document.querySelectorAll('[data-action="pick-main"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      _impactScreen.main = _impactScreen.main === btn.dataset.main ? null : btn.dataset.main;
      refreshImpactScreen();
    });
  });

  const retryBtn = document.querySelector('[data-action="retry-save-impact"]');
  if(retryBtn){
    retryBtn.addEventListener("click", function(){
      _impactScreen.errorMessage = null;
      saveImpact();
    });
  }

  const cancelBtn = document.querySelector('[data-action="annuler-dernier-impact"]');
  if(cancelBtn){
    cancelBtn.addEventListener("click", handleAnnulerDernierImpact);
  }
}

function tryAutoSaveImpact(){
  const s = _impactScreen;
  if(s.saving) return;
  if(!s.resultat || !s.zoneTir) return;
  if(isResultatCadre(s.resultat) && !s.zoneCage) return;
  saveImpact();
}

async function saveImpact(){
  const s = _impactScreen;
  s.saving = true;
  s.errorMessage = null;
  refreshImpactScreen();

  const payload = {
    gardien_id: state.gardienId,
    tireur_id: state.tireurCourant.id,
    zone_tir: s.zoneTir,
    resultat: s.resultat,
    zone_cage: isResultatCadre(s.resultat) ? s.zoneCage : null,
    type_tir: s.typeTir || null,
    main: s.main || null
  };

  try{
    const impact = await createImpact(payload);
    s.lastSaved = { id: impact.id, resultat: s.resultat, zoneTir: s.zoneTir, zoneCage: s.zoneCage };
    s.resultat = null;
    s.zoneTir = null;
    s.zoneCage = null;
    s.saving = false;
    refreshImpactScreen();
    scheduleConfirmationDismiss(4000);
  }catch(e){
    // P0-#1 : erreur explicite, sélection conservée — l'utilisateur peut
    // retenter (bouton "Réessayer" ou re-tap direct sur la zone de cage).
    s.saving = false;
    s.errorMessage = "Échec de l'enregistrement — réessaie";
    refreshImpactScreen();
  }
}

async function handleAnnulerDernierImpact(){
  const s = _impactScreen;
  if(!s.lastSaved || s.lastSaved.cancelled) return;
  const id = s.lastSaved.id;
  try{
    await deleteImpact(id);
    s.lastSaved = { cancelled: true };
    refreshImpactScreen();
    scheduleConfirmationDismiss(2000);
  }catch(e){
    // Échec de la suppression elle-même : le bandeau reste tel quel,
    // l'utilisateur peut retaper "Annuler".
  }
}

function scheduleConfirmationDismiss(delayMs){
  clearTimeout(_confirmationTimer);
  _confirmationTimer = setTimeout(function(){
    _impactScreen.lastSaved = null;
    refreshImpactScreen();
  }, delayMs);
}

async function onMountScreenImpact(){
  clearTimeout(_confirmationTimer);
  _impactScreen = {
    resultat: null, zoneTir: null, zoneCage: null, typeTir: null, main: null,
    saving: false, errorMessage: null, lastSaved: null
  };
  if(!state.tireurCourant) return;
  bindScreenImpact();
  try{
    const last = await getLastImpact(state.gardienId, state.tireurCourant.id);
    if(last){
      _impactScreen.typeTir = last.type_tir;
      _impactScreen.main = last.main;
      refreshImpactScreen();
    }
  }catch(e){
    // Pré-remplissage best-effort — un échec ici ne bloque pas la saisie.
  }
}

registerScreen("impact", renderScreenImpact, onMountScreenImpact);
