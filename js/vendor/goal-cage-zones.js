/*
 * Zone de but / cage (impact du tir) — extrait de FENIX Stats CF (app.js)
 * Système 2 sur 2 (voir README.md) — 9 zones, PAS de géométrie, PAS de SVG.
 * Juste une grille CSS 3×3 fixe (voir zones.css → .goal-zone-grid/.gz-cell).
 *
 * C'est un système totalement indépendant de terrain-zones.js : il ne
 * mesure pas où le tireur était sur le terrain, mais où le ballon a
 * atterri DANS la cage (haut/milieu/bas × gauche/centre/droit).
 */

// Codes de zone : Haut/Milieu/Bas × Gauche/Centre/Droit
const GOAL_ZONES = ["HG","HC","HD","MG","MC","MD","BG","BC","BD"];

// Glyphes affichés dans chaque case de la grille de sélection
const GZ_LABELS = { HG:"↖", HC:"↑", HD:"↗", MG:"←", MC:"●", MD:"→", BG:"↙", BC:"↓", BD:"↘" };

// Génère le HTML de la grille de SÉLECTION (au moment de taguer un tir).
// selectedZone: code déjà choisi (ou null) pour appliquer la classe "active".
// Le clic doit être branché sur [data-gz] → ta propre fonction d'enregistrement
// (dans FENIX, c'est clickGoalZone(zone) qui met à jour l'événement en cours
// et ferme la grille — logique couplée à l'état de l'app d'origine, pas
// reprise ici : à toi de reconnecter la sélection à ton propre modèle de données).
function renderGoalZoneGrid(selectedZone){
  return `<div class="goal-zone-grid gz-big">
    ${GOAL_ZONES.map(z => `<div class="gz-cell ${selectedZone===z ? "active" : ""}" data-gz="${z}">${GZ_LABELS[z]}</div>`).join("")}
  </div>`;
}

// Génère le HTML de la grille en mode HEATMAP (statistiques a posteriori) :
// même grille 3×3, mais colorée par ratio buts/tirs et affichant "buts/total"
// dans chaque case au lieu du glyphe flèche.
// shots: [{goalZone, isGoal, isSave}] — adapte les noms de champs à ton modèle.
function goalZoneHeatmap(shots, width){
  const w = width || "80%";
  const counts = {}; GOAL_ZONES.forEach(z => counts[z] = {goals:0, saves:0, offs:0, total:0});
  shots.forEach(s => {
    const z = s.goalZone; if(!z || !counts[z]) return;
    counts[z].total++;
    if(s.isGoal) counts[z].goals++;
    else if(s.isSave) counts[z].saves++;
    else counts[z].offs++;
  });
  const maxC = Math.max(...GOAL_ZONES.map(z => counts[z].total), 1);
  return `<div style="width:${w};margin:0 auto;">
    <div class="goal-zone-grid" style="width:100%;">
      ${GOAL_ZONES.map(z => {
        const c = counts[z];
        const opacity = c.total>0 ? (.2+.8*(c.total/maxC)) : 0;
        const gPct = c.total>0 ? c.goals/c.total : 0;
        const bg = c.total>0
          ? (gPct>.5 ? `rgba(80,200,120,${opacity})` : `rgba(78,205,232,${opacity})`)
          : "var(--bg3)";
        return `<div style="display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;background:${bg};color:${c.total>0?"#fff":"var(--t3)"};">${c.total>0?`${c.goals}/${c.total}`:""}</div>`;
      }).join("")}
    </div>
  </div>`;
}

// Exemple d'usage minimal :
//
//   // Pendant la saisie (sélection) :
//   panelEl.innerHTML = renderGoalZoneGrid(currentShot.goalZone);
//   panelEl.querySelectorAll('[data-gz]').forEach(el => {
//     el.onclick = () => { currentShot.goalZone = el.dataset.gz; rerender(); };
//   });
//
//   // En stats (heatmap a posteriori) :
//   statsEl.innerHTML = goalZoneHeatmap(allShots, "60%");
