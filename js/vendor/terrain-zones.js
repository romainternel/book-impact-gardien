/*
 * Zones du terrain (origine du tir) — extrait de FENIX Stats CF (app.js, STORY-43/72)
 * Système 1 sur 2 (voir README.md) — 11 zones géométriques réelles sur le terrain.
 *
 * Référentiel : viewBox SVG 350×208 (350 unités = 20m de large, but en haut, y=0).
 * ~17.5 unités/mètre. Toutes les fonctions ci-dessous travaillent en % (0-100)
 * en entrée/sortie de l'API publique, et convertissent en interne vers ce
 * référentiel viewBox pour le calcul géométrique.
 *
 * Portabilité : ce fichier est autonome (aucune dépendance à un état global
 * d'appli). Seul point d'intégration à adapter : les couleurs CSS `var(--court-line)`
 * etc. dans courtSvgMarkup()/renderCourtZones() — remplace-les par tes propres
 * tokens, ou copie les variables de zones.css.
 */

// ─── Fond de terrain (lignes, arcs 6m/9m, ligne des 4m, ligne de but) ───
// Géométrie officielle handball : la zone (6m) et la ligne des 9m ne sont PAS
// des demi-cercles centrés sur le milieu du but — ce sont deux quarts de
// cercle centrés sur CHAQUE POTEAU (rayon 6m / 9m), reliés par un segment
// droit de la largeur du but. Le rayon 9m dépasse la distance poteau→ligne
// de touche, donc l'arc des 9m rejoint la ligne de touche, pas la ligne de but.
function courtSvgMarkup(){
  return `
    <rect x="0" y="0" width="350" height="208" fill="var(--court-fill)"/>
    <line x1="0" y1="207" x2="350" y2="207" stroke="var(--court-line)" stroke-width="1" opacity=".5"/>
    <line x1="0" y1="1" x2="0" y2="208" stroke="var(--court-line)" stroke-width="1" opacity=".5"/>
    <line x1="350" y1="1" x2="350" y2="208" stroke="var(--court-line)" stroke-width="1" opacity=".5"/>
    <line x1="175" y1="0" x2="175" y2="208" stroke="var(--court-line)" stroke-width="1" stroke-dasharray="2,3" opacity=".4"/>
    <path d="M 43.75,1 A 105,105 0 0 0 148.75,105 L 201.25,105 A 105,105 0 0 0 306.25,1" fill="none" stroke="var(--court-line)" stroke-width="1.5"/>
    <path d="M 0,51.76 A 157.5,157.5 0 0 0 148.75,157.5 L 201.25,157.5 A 157.5,157.5 0 0 0 350,51.76" fill="none" stroke="var(--court-line-dash)" stroke-width="1.5" stroke-dasharray="5,4"/>
    <line x1="168" y1="122.5" x2="182" y2="122.5" stroke="var(--court-line)" stroke-width="2"/>
    <line x1="170" y1="70" x2="180" y2="70" stroke="var(--court-line)" stroke-width="2"/>
    <line x1="148.75" y1="1" x2="201.25" y2="1" stroke="var(--court-goal)" stroke-width="3"/>
  `;
}

// ─── Constantes de découpage ───
// Portée des ailes (triangles droits aux 2 coins), en unités viewBox.
// Valeur ajustée empiriquement sur retours d'usage réel (des tirs près du
// corner tombaient hors du triangle et étaient mal classés avec une valeur
// plus petite) — pas une valeur théorique déduite d'une règle handball.
const COURT_WING_AY = 80, COURT_WING_AX = 100;

// Classifie une position de tir (% 0-100) en une des 11 zones.
function shotZoneCourt(xPct, yPct){
  const X = xPct/100*350, Y = yPct/100*208;
  const postL = 148.75, postR = 201.25, R6 = 105, R9 = 157.5;
  const AY = COURT_WING_AY, AX = COURT_WING_AX;
  const centerHalfW = postR-postL, splitL = 175-centerHalfW, splitR = 175+centerHalfW;
  if(Y<=0) return X<AX ? "AILG" : (X>350-AX ? "AILD" : "6MC");
  if(X<AX && Y < AY*(1-X/AX)) return "AILG";
  if(X>350-AX && Y < AY*(1-(350-X)/AX)) return "AILD";
  if(X>=splitL && X<=splitR){
    let b6, b9;
    if(X>=postL && X<=postR){ b6=R6; b9=R9; }
    else { const post=X<postL?postL:postR, dx=Math.abs(X-post); b6=Math.sqrt(Math.max(0,R6*R6-dx*dx)); b9=Math.sqrt(Math.max(0,R9*R9-dx*dx)); }
    if(Y<b6) return "6MC";
    if(Y<b9) return "69MC";
    return "9MC";
  }
  const post = X<splitL ? postL : postR, dir = X<splitL ? -1 : 1;
  const dx = Math.abs(X-post), r = Math.hypot(dx,Y);
  if(r<R6) return dir<0 ? "6MG" : "6MD";
  if(r<R9) return dir<0 ? "69MG" : "69MD";
  return dir<0 ? "9MG" : "9MD";
}

// Ordre de RENDU (pas seulement d'agrégation) : 6MG/6MC/6MD DOIVENT être
// dessinées APRÈS 69MG/69MC/69MD. Les polygones 69MG/69MD réutilisent tels
// quels les anciens polygones "6m" (bornés par R9, jamais exactement par R6
// à cause du triangle d'aile qui empiète sur la frontière R6 par endroits) :
// le petit polygone 6MG/6MD est dessiné PAR-DESSUS pour masquer visuellement
// la portion intérieure, plutôt que de calculer une vraie soustraction de
// polygones. Côté centre (6MC/69MC), les bandes sont géométriquement exactes,
// l'ordre n'y a pas d'importance.
const COURT_ZONE_ORDER = ["AILG","AILD","69MG","9MG","69MC","9MC","69MD","9MD","6MG","6MC","6MD"];

// Position de texte pré-calculée par zone (% du terrain) — pas le centroïde
// brut, qui tombe mal sur les zones en arc/concaves.
const COURT_ZONE_LABEL_POS = {
  AILG:[5.1,7.7], AILD:[94.9,7.7],
  "69MG":[26.3,58], "69MC":[50,41.8], "69MD":[73.7,58],
  "9MG":[10,85.6], "9MC":[50,88], "9MD":[90,85.6],
  "6MG":[24,16], "6MC":[50,19], "6MD":[76,16]
};

let _courtZonesCache = null;

// Génère les 11 polygones de zone (points en %, une seule fois — mis en
// cache, ne dépend d'aucune donnée de match).
function buildCourtZones(){
  if(_courtZonesCache) return _courtZonesCache;
  const VBW = 350, postL = 148.75, postR = 201.25, R6 = 105, R9 = 157.5;
  const AY = COURT_WING_AY, AX = COURT_WING_AX;
  const toPct = (X,Y) => ({x:X/VBW*100, y:Y/208*100});

  function arcPoints(post, dir, radius, angleFrom, angleTo, steps=24){
    const pts=[];
    for(let i=0;i<=steps;i++){
      const a=(angleFrom+(angleTo-angleFrom)*i/steps)*Math.PI/180;
      pts.push(toPct(post+dir*radius*Math.cos(a), radius*Math.sin(a)));
    }
    return pts;
  }

  const touchAngle = Math.acos(postL/R9)*180/Math.PI;
  const touchY = R9*Math.sin(touchAngle*Math.PI/180);
  const farY = 207;
  const centerHalfW = postR-postL, splitL = 175-centerHalfW, splitR = 175+centerHalfW;
  function angleAtX(post,X,radius){ return Math.acos(Math.abs(post-X)/radius)*180/Math.PI; }
  const angleSplitL9 = angleAtX(postL,splitL,R9), angleSplitR9 = angleAtX(postR,splitR,R9);
  const ySplit9 = R9*Math.sin(angleSplitL9*Math.PI/180);
  const angleSplitL6 = angleAtX(postL,splitL,R6), angleSplitR6 = angleAtX(postR,splitR,R6);
  const ySplit6 = R6*Math.sin(angleSplitL6*Math.PI/180);

  // POINT PIÉGEUX (documenté dans les risques du projet d'origine) : l'arc R6
  // croise la diagonale du triangle d'aile AVANT d'atteindre la ligne de but
  // (contrairement à R9). Sans ce correctif, les zones 6MG/6MD débordent sur
  // le territoire AILG/AILD. Pas de solution géométrique fermée simple →
  // recherche du point de croisement exact par bissection.
  function wingArcCrossAngle(radius){
    let lo = postL-radius, hi = AX;
    for(let i=0;i<40;i++){
      const mid=(lo+hi)/2, dx=postL-mid;
      const b=Math.sqrt(Math.max(0,radius*radius-dx*dx));
      const hyp=AY*(1-mid/AX);
      if(hyp-b>0) lo=mid; else hi=mid;
    }
    return angleAtX(postL,(lo+hi)/2,radius);
  }
  const angleWingCross6 = wingArcCrossAngle(R6);

  const z = {};
  z.AILG = [toPct(0,0), toPct(0,AY), toPct(AX,0)];
  z.AILD = [toPct(VBW,0), toPct(VBW,AY), toPct(VBW-AX,0)];

  z['69MG'] = [toPct(AX,0), toPct(splitL,0), toPct(splitL,ySplit9), ...arcPoints(postL,-1,R9,angleSplitL9,touchAngle), toPct(0,AY)];
  z['69MD'] = [toPct(VBW-AX,0), toPct(splitR,0), toPct(splitR,ySplit9), ...arcPoints(postR,1,R9,angleSplitR9,touchAngle), toPct(VBW,AY)];
  z['9MG'] = [toPct(0,touchY), ...arcPoints(postL,-1,R9,touchAngle,angleSplitL9), toPct(splitL,farY), toPct(0,farY)];
  z['9MD'] = [toPct(VBW,touchY), ...arcPoints(postR,1,R9,touchAngle,angleSplitR9), toPct(splitR,farY), toPct(VBW,farY)];

  // 6MG/6MD : petit croissant borné par R6, dessiné par-dessus 69MG/69MD.
  // L'arc s'arrête à angleWingCross6 (pas à l'angle 0/ligne de but) : au-delà,
  // la vraie frontière devient la diagonale du triangle d'aile, pas l'arc R6
  // — la fermeture implicite du polygone (dernier point → premier point)
  // trace cette diagonale exactement (c'est déjà une droite).
  z['6MG'] = [toPct(AX,0), toPct(splitL,0), toPct(splitL,ySplit6), ...arcPoints(postL,-1,R6,angleSplitL6,angleWingCross6)];
  z['6MD'] = [toPct(VBW-AX,0), toPct(splitR,0), toPct(splitR,ySplit6), ...arcPoints(postR,1,R6,angleSplitR6,angleWingCross6)];

  // 6MC/69MC/9MC : couloir central, aucun chevauchement avec le triangle
  // d'aile (splitL/splitR > AX/(VBW-AX)) — bandes géométriquement exactes.
  // 69MC = anneau entre R6 (intérieur) et R9 (extérieur), tracé intérieur
  // aller (gauche→droite) puis extérieur retour (droite→gauche).
  z['6MC'] = [toPct(splitL,0), toPct(splitR,0), ...arcPoints(postR,1,R6,angleSplitR6,90), toPct(postR,R6), toPct(postL,R6), ...arcPoints(postL,-1,R6,90,angleSplitL6)];
  z['69MC'] = [toPct(splitL,ySplit6), ...arcPoints(postL,-1,R6,angleSplitL6,90), toPct(postL,R6), toPct(postR,R6), ...arcPoints(postR,1,R6,90,angleSplitR6), toPct(splitR,ySplit9), ...arcPoints(postR,1,R9,angleSplitR9,90), toPct(postR,R9), toPct(postL,R9), ...arcPoints(postL,-1,R9,90,angleSplitL9)];
  z['9MC'] = [toPct(splitL,ySplit9), ...arcPoints(postL,-1,R9,angleSplitL9,90), toPct(postL,R9), toPct(postR,R9), ...arcPoints(postR,1,R9,90,angleSplitR9), toPct(splitR,ySplit9), toPct(splitR,farY), toPct(splitL,farY)];

  _courtZonesCache = z;
  return z;
}

// shots: [{x, y, goal}] en % (0-100). Retourne {ZONE: {g, t}} — g=buts, t=tirs.
function aggregateCourtZones(shots){
  const data = {}; COURT_ZONE_ORDER.forEach(z => data[z] = {g:0, t:0});
  shots.forEach(s => {
    const z = shotZoneCourt(s.x, s.y);
    if(!data[z]) return;
    data[z].t++; if(s.goal) data[z].g++;
  });
  return data;
}

// Rendu SVG des zones colorées + scores, à superposer à courtSvgMarkup().
// shots: [{x,y,goal}] en %. penData optionnel: {g,t} pour un marqueur 7m
// séparé (les pénaltys n'ont pas de x/y — l'origine d'un 7m est toujours
// le même point).
function renderCourtZones(shots, penData){
  const zones = buildCourtZones();
  const data = aggregateCourtZones(shots);
  const toVB = p => ({x: p.x*3.5, y: p.y*2.08}); // % → viewBox 350×208

  const polys = COURT_ZONE_ORDER.map(z => {
    const pts = zones[z].map(p => { const v=toVB(p); return v.x+","+v.y; }).join(" ");
    const d = data[z];
    const fill = d.t===0 ? "var(--bg3)" : (d.g/d.t>0.5 ? "rgba(80,200,120,.85)" : "rgba(78,205,232,.85)");
    return `<polygon points="${pts}" fill="${fill}" stroke="var(--court-line)" stroke-width=".6" stroke-linejoin="round"/>`;
  }).join("");

  const labels = COURT_ZONE_ORDER.map(z => {
    const d = data[z]; if(d.t===0) return "";
    const p = COURT_ZONE_LABEL_POS[z], v = toVB({x:p[0], y:p[1]});
    return `<text x="${v.x}" y="${v.y}" style="font-size:9px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:rgba(0,0,0,.45);stroke-width:1.6px;">${d.g}/${d.t}</text>`;
  }).join("");

  const pen = penData || {g:0, t:0};
  const penColor = pen.t===0 ? "var(--bg3)" : (pen.g/pen.t>0.5 ? "#50C878" : "#4ECDE8");
  const penMarker = `<circle cx="175" cy="122.5" r="11" fill="${penColor}" stroke="var(--panel)" stroke-width="1.2"/>` +
    (pen.t>0
      ? `<text x="175" y="126" style="font-size:9px;font-weight:800;fill:#0c1520;text-anchor:middle;">${pen.g}/${pen.t}</text>`
      : `<text x="175" y="125.5" style="font-size:7.5px;font-weight:800;fill:#0c1520;text-anchor:middle;">7m</text>`);

  return polys + labels + penMarker;
}

// Exemple d'usage minimal :
//
//   const shots = [{x:45, y:10, goal:true}, {x:60, y:35, goal:false}, ...];
//   const svgContent = courtSvgMarkup() + renderCourtZones(shots, {g:2, t:3});
//   container.innerHTML = `<svg viewBox="0 0 350 208" preserveAspectRatio="none">${svgContent}</svg>`;
