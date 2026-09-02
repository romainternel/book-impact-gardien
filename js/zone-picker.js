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

// Mode "heatmap" du terrain (STORY-07b) — variante de renderCourtZonePicker
// qui colore chaque zone selon un ratio buts/tirs déjà agrégé, plutôt qu'un
// état de sélection binaire. Réutilise buildCourtZones()/COURT_ZONE_ORDER
// tels quels, sans passer par shotZoneCourt (les impacts stockent déjà un
// code de zone discret, pas des coordonnées x/y continues — cf.
// docs/stories/STORY-07b-book-heatmaps-croisees.md, note d'implémentation).
// dataByZone: { [zoneCode]: {g, t} }. activeZone : zone actuellement
// sélectionnée comme filtre (contour accent), ou null.
function renderCourtZoneHeatmap(dataByZone, activeZone){
  const zones = buildCourtZones();
  const toVB = p => ({x: p.x*3.5, y: p.y*2.08});

  const polys = COURT_ZONE_ORDER.map(function(z){
    const pts = zones[z].map(function(p){ const v = toVB(p); return v.x+","+v.y; }).join(" ");
    const d = dataByZone[z] || { g: 0, t: 0 };
    const fill = d.t === 0 ? "var(--bg3)" : (d.g / d.t > 0.5 ? "rgba(80,200,120,.85)" : "rgba(78,205,232,.85)");
    const active = activeZone === z ? "zone-heat-active" : "";
    return `<polygon points="${pts}" class="zone-heat ${active}" data-zone="${z}" fill="${fill}"/>`;
  }).join("");

  const labels = COURT_ZONE_ORDER.map(function(z){
    const d = dataByZone[z];
    if(!d || d.t === 0) return "";
    const p = COURT_ZONE_LABEL_POS[z], v = toVB({ x: p[0], y: p[1] });
    return `<text x="${v.x}" y="${v.y}" class="zone-heat-label">${d.g}/${d.t}</text>`;
  }).join("");

  return polys + labels;
}
