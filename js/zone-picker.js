/*
 * Mode "sélection" du terrain (zone de tir) — nouveau, absent de l'export
 * fenix-terrain-zones-export (qui ne fournit que le rendu heatmap). Réutilise
 * buildCourtZones()/COURT_ZONE_ORDER de vendor/terrain-zones.js sans les
 * modifier. Voir docs/architecture.md §5 pour le point d'attention sur les
 * zones concaves (69MG/69MC/69MD).
 *
 * Dépend des globals exposés par vendor/terrain-zones.js — à charger après.
 */

function renderCourtZonePicker(selectedZone){
  const zones = buildCourtZones();
  const toVB = p => ({x: p.x*3.5, y: p.y*2.08});
  return COURT_ZONE_ORDER.map(z => {
    const pts = zones[z].map(p => { const v = toVB(p); return v.x+","+v.y; }).join(" ");
    const active = selectedZone === z ? "active" : "";
    return `<polygon points="${pts}" class="zone-pick ${active}" data-zone="${z}"/>`;
  }).join("");
}

// Attache un unique listener délégué sur le <svg> conteneur. callback(zoneCode)
// est appelé avec le code de la zone tapée (ex. "AILG").
function bindCourtZonePicker(svgEl, callback){
  svgEl.addEventListener("click", function(evt){
    const target = evt.target.closest("[data-zone]");
    if(!target) return;
    callback(target.dataset.zone);
  });
}
