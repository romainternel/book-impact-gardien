# QA — STORY-05 : Composant zone-picker terrain

## Critères validés ✅
- ✅ `renderCourtZonePicker(selectedZone)` génère exactement les 11 polygones avec les 11 `data-zone` attendus, dans l'ordre de `COURT_ZONE_ORDER` (vérifié en lisant le DOM généré réellement dans le navigateur).
- ✅ Tap sur le vrai centre géométrique de `69MC`, `69MG` (hors axe), `6MC`, `9MC` → résolution correcte de la zone, y compris sur les bandes concaves signalées à risque.
- ✅ Classe `active` correctement appliquée à un seul polygone à la fois après sélection, avec le style de contour accent défini par le Visual Crafter.
- ✅ `js/vendor/terrain-zones.js` non modifié (diff vide re-vérifié).
- ✅ API du composant (`renderCourtZonePicker`, `bindCourtZonePicker`) utilisable indépendamment de `state.js` — pas de couplage à l'état applicatif, conforme à la story.

## Cas limites testés
- Clic délégué via un seul listener sur le `<svg>` (pas un listener par polygone) — confirmé fonctionnel via un vrai événement `click` bubbling, pas une simulation directe de callback.
- Zone hors-axe (loin du centre, formule `sqrt`) testée en plus des zones centrales — comportement correct.

## Visuel
Rendu conforme à `docs/visual/book-impact-gardien.md` §4 (ligne "Polygone zone terrain") : fond `--bg3` au repos, contour `--accent` + `filter: brightness(1.1)` en sélection — capture visuelle inspectée sur la zone `69MC` sélectionnée, correspond à la position géométrique réelle attendue.

## Régression
Aucune — fichiers vendor inchangés (diff vide), aucun écran existant modifié (le composant n'est pas encore câblé dans un écran, c'est prévu en STORY-06a).

## Bugs trouvés
Aucun. Une observation non bloquante remontée par le Code Reviewer concernant `COURT_ZONE_LABEL_POS` (pertinente pour la QA visuelle de STORY-07b, pas pour cette story) — notée, pas un bug de cette story.

## Verdict
**PASSED**
