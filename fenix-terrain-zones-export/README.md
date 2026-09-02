# Export — Zones terrain & cage (extrait de FENIX Stats CF)

Extrait le 2026-08-24 depuis le projet FENIX Stats CF (`fenix/app.js`, `fenix/style.css`) pour réutilisation dans un autre projet. Rien n'a été modifié dans le projet source — c'est une copie/adaptation.

## Il y a DEUX systèmes de zones distincts et indépendants

C'est le point le plus important à comprendre avant de réutiliser ce code : "terrain" et "cage" ne mesurent pas la même chose et ne fonctionnent pas du tout pareil.

### 1. Zones du terrain — `terrain-zones.js` — où le tireur était placé
- **11 zones**, découpées par la vraie géométrie handball (arcs 6m/9m centrés sur les poteaux, pas sur le but)
- Calculées via un **SVG** avec de vrais polygones (`viewBox 350×208`)
- Codes : `AILG`, `AILD` (ailes) + `6MG/6MC/6MD`, `69MG/69MC/69MD`, `9MG/9MC/9MD` (3 profondeurs × 3 secteurs)
- Fichier source d'origine : `fenix/app.js` lignes ~2753-2939

### 2. Zone de but / cage — `goal-cage-zones.js` — où le ballon a fini dans les cages
- **9 zones**, simple grille 3×3 (Haut/Milieu/Bas × Gauche/Centre/Droit)
- **Pas de SVG, pas de géométrie** — juste du CSS Grid avec 9 cases fixes
- Codes : `HG HC HD / MG MC MD / BG BC BD`
- Fichier source d'origine : `fenix/app.js` lignes ~955, ~1433, ~2181-2200 ; `fenix/style.css` lignes ~256-260

Dans l'app d'origine, un tir cadré (but/arrêt) passe par les DEUX systèmes l'un après l'autre : d'abord on tape sa position sur le terrain (système 1 → détermine la zone d'origine), puis une grille apparaît pour dire où le ballon a fini dans la cage (système 2 → zone d'impact). Les deux valeurs sont stockées séparément sur l'événement (`x`/`y` pour le terrain, `goalZone` pour la cage).

## Fichiers de cet export

| Fichier | Contenu |
|---|---|
| `terrain-zones.js` | Système 1 complet : fond de terrain SVG, découpage en 11 zones, génération des polygones, rendu heatmap |
| `goal-cage-zones.js` | Système 2 complet : grille de sélection 3×3, rendu heatmap |
| `zones.css` | Tous les tokens CSS et classes nécessaires aux deux fichiers JS |
| `screenshots/visual-1-goal-cage-9zones.png` | La grille de sélection 9 zones en conditions réelles (pendant la saisie d'un but) |
| `screenshots/visual-2-terrain-11zones-full.png` | Les deux terrains (11 zones) avec des tirs réels tagués, vue Stats → Comparaison |

## Portabilité — ce qui est autonome vs ce qu'il faut réadapter

**Autonome, copiable tel quel :**
- `terrain-zones.js` en entier — aucune dépendance à un état global d'app, juste des fonctions pures + un cache mémoire local
- `goal-cage-zones.js` — `GOAL_ZONES`, `GZ_LABELS`, `renderGoalZoneGrid()`, `goalZoneHeatmap()`

**À reconnecter à ton propre modèle de données :**
- Le clic sur une case de la grille cage (`[data-gz]`) — dans FENIX c'est branché sur `clickGoalZone()`, qui écrit directement dans l'état global de l'app (couplé, pas repris ici). Le README + les commentaires du fichier montrent le point d'accroche exact (`el.onclick = () => currentShot.goalZone = ...`).
- Le format de tes données de tir (`{x, y, goal}` pour le terrain, `{goalZone, isGoal, isSave}` pour la cage) — adapte les noms de champs si ton modèle diffère.
- Les couleurs CSS (`--court-fill`, `--fenix-sky`, etc.) — remplace-les par ta propre charte, `zones.css` te donne les valeurs d'origine comme référence.

## Deux points géométriques à ne pas perdre si tu retouches `terrain-zones.js`

1. **Les arcs 6m/9m sont centrés sur les poteaux**, pas sur le centre du but — c'est la vraie géométrie handball. Un demi-cercle centré sur le but donnerait un résultat visuellement proche mais faux.
2. **L'arc à 6m croise la diagonale du triangle d'aile avant d'atteindre la ligne de but** (contrairement à l'arc à 9m). Sans le correctif `wingArcCrossAngle()` (recherche par bissection), les zones `6MG`/`6MD` débordent visuellement sur les zones d'aile. Ce bug est arrivé une fois dans le projet d'origine — cf. commentaires dans le fichier.
