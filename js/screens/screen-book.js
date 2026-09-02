/*
 * Écran 4 — Book tireur : stats + historique (STORY-07a). Maquette :
 * docs/design/book-impact-gardien.md Écran 4 (première moitié — les
 * heatmaps croisées terrain × cage arrivent en STORY-07b sur ce même écran).
 *
 * Agrégation club-wide (tous gardiens confondus) pour les stats descriptives
 * du tireur, décision PM docs/prd.md §2.2. Le taux d'arrêt est filtré sur
 * le gardien actif uniquement.
 *
 * Note d'interprétation (documentée en Code Review) : "poste favori" du PRD
 * est calculé à partir de zone_tir regroupée en 5 secteurs de style poste
 * (ZONE_TIR_GROUPS), pas depuis tireurs.poste (valeur fixe déjà affichée
 * dans le header — une stat dérivée de l'historique des tirs est plus
 * informative qu'une redite d'un champ statique).
 */

const ZONE_TIR_GROUPS = {
  AILG: "Aile G", AILD: "Aile D",
  "6MG": "Arrière G", "69MG": "Arrière G", "9MG": "Arrière G",
  "6MC": "Centre", "69MC": "Centre", "9MC": "Centre",
  "6MD": "Arrière D", "69MD": "Arrière D", "9MD": "Arrière D"
};

function computeBookStats(impacts, gardienId){
  const total = impacts.length;

  const withMain = impacts.filter(function(i){ return !!i.main; });
  const mainCounts = { D: 0, G: 0 };
  withMain.forEach(function(i){ mainCounts[i.main]++; });
  const mainDominante = withMain.length > 0
    ? (mainCounts.D >= mainCounts.G ? "D" : "G")
    : null;
  const mainPct = withMain.length > 0
    ? Math.round(100 * Math.max(mainCounts.D, mainCounts.G) / withMain.length)
    : null;

  let favoriteZoneGroup = null;
  if(total > 0){
    const groupCounts = {};
    impacts.forEach(function(i){
      const g = ZONE_TIR_GROUPS[i.zone_tir] || i.zone_tir;
      groupCounts[g] = (groupCounts[g] || 0) + 1;
    });
    favoriteZoneGroup = Object.keys(groupCounts).reduce(function(a, b){
      return groupCounts[a] >= groupCounts[b] ? a : b;
    });
  }

  const gardienImpacts = impacts.filter(function(i){ return i.gardien_id === gardienId; });
  const cadres = gardienImpacts.filter(function(i){ return i.resultat === "but" || i.resultat === "arret"; });
  const arrets = cadres.filter(function(i){ return i.resultat === "arret"; });
  const tauxArret = cadres.length > 0 ? Math.round(100 * arrets.length / cadres.length) : null;

  return {
    total: total,
    mainDominante: mainDominante,
    mainPct: mainPct,
    favoriteZoneGroup: favoriteZoneGroup,
    tauxArret: tauxArret,
    tauxArretDenom: cadres.length
  };
}

let _bookScreen = { status: "loading", impacts: [], stats: null };

function renderBookStats(stats){
  const notEnough = stats.total < 3;

  const mainBody = (!notEnough && stats.mainDominante)
    ? `<div class="stat-value">${stats.mainPct}%</div><div class="stat-label">Main ${escapeHtml(stats.mainDominante)}</div>`
    : `<div class="stat-hint">Pas assez de données</div><div class="stat-label">Main dominante</div>`;

  const zoneBody = (!notEnough && stats.favoriteZoneGroup)
    ? `<div class="stat-value">${escapeHtml(stats.favoriteZoneGroup)}</div><div class="stat-label">Zone favorite</div>`
    : `<div class="stat-hint">Pas assez de données</div><div class="stat-label">Zone favorite</div>`;

  const tauxBody = stats.tauxArretDenom > 0
    ? `<div class="stat-value">${stats.tauxArret}%</div><div class="stat-label">Arrêt face à ${escapeHtml(state.gardienNom || "toi")}</div>`
    : `<div class="stat-hint">—</div><div class="stat-label">Arrêt face à ${escapeHtml(state.gardienNom || "toi")}</div>`;

  return `<div class="stat-grid">
    <div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Tirs</div></div>
    <div class="stat-card">${mainBody}</div>
    <div class="stat-card">${zoneBody}</div>
    <div class="stat-card">${tauxBody}</div>
  </div>`;
}

function renderHistoriqueRow(impact){
  const date = new Date(impact.date_visionnage).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const cage = impact.zone_cage ? "→" + escapeHtml(impact.zone_cage) : "";
  return `<div class="historique-row">
    <span class="historique-date">${date}</span>
    <span class="historique-contexte">${escapeHtml(impact.contexte_match || "—")}</span>
    <span class="historique-zones">${escapeHtml(impact.zone_tir)}${cage}</span>
    <span class="badge badge-${escapeHtml(impact.resultat)}">${resultatLabel(impact.resultat)}</span>
  </div>`;
}

function renderScreenBook(){
  const t = state.tireurCourant;
  if(!t){
    return `<div class="screen-placeholder">Aucun tireur sélectionné</div>`;
  }

  const titleParts = [t.nom];
  const metaParts = [t.club, posteLabel(t.poste), t.lateralite ? (t.lateralite === "D" ? "Droitier" : "Gaucher") : null].filter(Boolean);
  const header = renderAppHeader(titleParts.concat(metaParts.length ? [metaParts.join(" · ")] : []).join(" — "), { back: "impact" });

  const s = _bookScreen;
  let body;
  if(s.status === "loading"){
    body = `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }else if(s.status === "error"){
    body = `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-book">Réessayer</button></div>`;
  }else if(s.impacts.length === 0){
    body = `<div class="empty-state"><p>Aucun tir enregistré pour ce tireur</p><button class="btn-secondary" data-action="back-to-impact">Retour à la saisie</button></div>`;
  }else{
    body = `
      ${renderBookStats(s.stats)}
      <div class="section-label book-history-label">Historique</div>
      <div class="historique-list">${s.impacts.map(renderHistoriqueRow).join("")}</div>
    `;
  }

  return `<div class="screen-book">${header}${body}</div>`;
}

function refreshBookScreen(){
  document.getElementById("app").innerHTML = renderScreenBook();
  bindScreenBook();
}

function bindScreenBook(){
  bindAppHeader();

  const retry = document.querySelector('[data-action="retry-book"]');
  if(retry) retry.addEventListener("click", loadBookScreen);

  const backBtn = document.querySelector('[data-action="back-to-impact"]');
  if(backBtn){
    backBtn.addEventListener("click", function(){ renderScreen("impact"); });
  }
}

async function loadBookScreen(){
  _bookScreen = { status: "loading", impacts: [], stats: null };
  refreshBookScreen();
  if(!state.tireurCourant) return;
  try{
    const impacts = await getImpactsForTireur(state.tireurCourant.id);
    const stats = computeBookStats(impacts, state.gardienId);
    _bookScreen = { status: "ready", impacts: impacts, stats: stats };
    refreshBookScreen();
  }catch(e){
    _bookScreen = { status: "error", impacts: [], stats: null };
    refreshBookScreen();
  }
}

registerScreen("book", renderScreenBook, loadBookScreen);
