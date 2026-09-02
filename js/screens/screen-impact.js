/*
 * Écran 3 — Saisie impact, boucle cœur (STORY-06a). Maquette et logique
 * d'enchaînement : docs/design/book-impact-gardien.md Écran 3, section
 * "Décision UX structurante". Résultat/Zone de tir/Zone de cage tapables
 * dans n'importe quel ordre ; enregistrement automatique dès que les champs
 * requis pour le résultat en cours sont complets — pas de bouton "Valider".
 *
 * Robustesse (verrouillage anti double-tap, bandeau d'erreur explicite,
 * annulation du dernier impact) : hors scope, cf. STORY-06b.
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

let _impactScreen = { resultat: null, zoneTir: null, zoneCage: null, typeTir: null, main: null };

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

  return `
    <div class="screen-impact">
      ${header}
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
      <div class="impact-section quick-selectors">
        <div class="quick-row"><span class="quick-label">Type</span><div class="chip-row">${typeChips}</div></div>
        <div class="quick-row"><span class="quick-label">Main</span><div class="chip-row">${mainChips}</div></div>
      </div>
    </div>
  `;
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
      _impactScreen.resultat = btn.dataset.resultat;
      if(!isResultatCadre(_impactScreen.resultat)) _impactScreen.zoneCage = null;
      refreshImpactScreen();
      tryAutoSaveImpact();
    });
  });

  const svg = document.getElementById("impact-court-svg");
  if(svg){
    bindCourtZonePicker(svg, function(zone){
      _impactScreen.zoneTir = zone;
      refreshImpactScreen();
      tryAutoSaveImpact();
    });
  }

  document.querySelectorAll("[data-gz]").forEach(function(cell){
    cell.addEventListener("click", function(){
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
}

function tryAutoSaveImpact(){
  const s = _impactScreen;
  if(!s.resultat || !s.zoneTir) return;
  if(isResultatCadre(s.resultat) && !s.zoneCage) return;
  saveImpact();
}

async function saveImpact(){
  const s = _impactScreen;
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
    await createImpact(payload);
    _impactScreen.resultat = null;
    _impactScreen.zoneTir = null;
    _impactScreen.zoneCage = null;
    refreshImpactScreen();
  }catch(e){
    // Bandeau d'erreur explicite + conservation de la sélection : STORY-06b.
    // Pour l'instant, on ne réinitialise pas la sélection (l'utilisateur peut
    // retenter en re-tapant la zone de cage) mais on n'affiche rien de plus.
    console.error("Échec de l'enregistrement de l'impact", e);
  }
}

async function onMountScreenImpact(){
  _impactScreen = { resultat: null, zoneTir: null, zoneCage: null, typeTir: null, main: null };
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
