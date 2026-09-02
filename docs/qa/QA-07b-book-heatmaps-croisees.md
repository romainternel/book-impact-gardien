# QA — STORY-07b : Book tireur, heatmaps croisées

## Critères validés ✅
- ✅ Heatmap terrain affiche, pour chaque zone avec au moins un tir, le ratio buts/tirs et une couleur reflétant ce ratio — vérifié exact sur un jeu de données connu (AILD 2/3 vert, 9MC 0/2 bleu, 6MG 1/1 vert).
- ✅ Tap sur une zone terrain filtre la heatmap cage sur les impacts de cette zone — vérifié (AILD → 3 cases au lieu de 5, correspondant exactement aux 3 tirs AILD) ; chip "Tous ✕" apparaît et réinitialise correctement.
- ✅ Sans filtre, heatmap cage agrège tous les `zone_cage` du tireur — vérifié (5 cases correspondant aux 5 tirs cadrés).
- ✅ Les impacts `hors_cadre` sont comptés dans la heatmap terrain (zone `9MC` incluait le hors_cadre dans son total de 2) mais absents de la heatmap cage — vérifié.
- ✅ `terrain-zones.js`/`goal-cage-zones.js` non modifiés (diff vide re-confirmé).

## Cas limites testés
- Re-tap sur la même zone déjà filtrée : désactive le filtre (comportement bonus au-delà du strict AC, cohérent avec l'attente utilisateur naturelle).

## Régression
- Stats et historique de STORY-07a toujours corrects avec les heatmaps ajoutées par-dessus.
- Écran de saisie (STORY-06a/06b) et picker terrain (STORY-05) non affectés — `renderCourtZoneHeatmap` est une fonction séparée de `renderCourtZonePicker`, aucun risque de régression croisée entre les deux usages.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
