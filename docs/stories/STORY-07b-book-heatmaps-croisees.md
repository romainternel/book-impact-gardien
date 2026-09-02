# STORY-07b — Écran Book tireur : heatmaps croisées terrain × cage

**En tant que** gardien qui prépare un match,
**Je veux** voir en un coup d'œil où un tireur vise le plus souvent dans la cage, et pouvoir filtrer cette vue par zone de départ du tir,
**Afin de** anticiper visuellement son schéma de tir sans lire une liste de chiffres.

## Contexte technique
- Zone concernée : `js/screens/screen-book.js` (complète l'écran posé en STORY-07a).
- Maquette : `docs/design/book-impact-gardien.md` — Écran 4, sections "ZONE DE TIR" / "ZONE DE CAGE".
- Réutilise **tel quel** : `renderCourtZones(shots, penData)` de `terrain-zones.js` pour la heatmap terrain (adapter le format d'entrée : `shots = impacts.map(i => ({x, y, goal: i.resultat==='but'}))` — **attention** : `renderCourtZones` attend des positions `x,y` en %, alors que notre modèle stocke un code de zone discret (`zone_tir`), pas une position continue. Voir note d'implémentation ci-dessous.
- Réutilise **tel quel** : `goalZoneHeatmap(shots, width)` de `goal-cage-zones.js` pour la heatmap cage, avec `shots = impacts.map(i => ({goalZone: i.zone_cage, isGoal: i.resultat==='but', isSave: i.resultat==='arret'}))`.

### Note d'implémentation — écart de format à résoudre
`renderCourtZones` est conçu pour agréger des positions `{x,y}` continues (via `shotZoneCourt`), pas des codes de zone déjà discrétisés. Ici les impacts stockent directement un code (`zone_tir = "AILG"` par ex.), pas de `x,y`. Deux options, à trancher en story :
1. Écrire une variante d'agrégation qui saute `shotZoneCourt` et compte directement par code de zone (probablement le plus simple — reprendre `aggregateCourtZones` en remplaçant `shotZoneCourt(s.x,s.y)` par `s.zone_tir` directement), puis appeler le rendu polygonal existant avec ce résultat pré-agrégé.
2. Générer un point `x,y` représentatif au centre de chaque zone (via `COURT_ZONE_LABEL_POS`) pour chaque impact et laisser `aggregateCourtZones` reclassifier — plus fragile (dépend que le point représentatif retombe bien dans sa propre zone via `shotZoneCourt`, ce qui n'est pas garanti pour toutes les zones).
Recommandation : **option 1**, elle est plus directe et n'introduit pas de dépendance cachée entre `COURT_ZONE_LABEL_POS` et `shotZoneCourt`.

## Critères d'acceptation
- [ ] La heatmap terrain affiche, pour chaque zone ayant au moins un tir, le ratio "buts/tirs" et une couleur reflétant ce ratio (réutilise le rendu de `renderCourtZones`, adapté selon la note ci-dessus).
- [ ] Un tap sur une zone du terrain filtre la heatmap cage sur les seuls impacts dont `zone_tir` correspond ; un chip "Tous ✕" apparaît et réinitialise le filtre.
- [ ] Sans filtre actif, la heatmap cage agrège tous les `zone_cage` du tireur (tous `zone_tir` confondus).
- [ ] Les impacts `hors_cadre` (sans `zone_cage`) sont comptés dans la heatmap terrain (ils ont bien une zone de tir) mais logiquement absents de la heatmap cage.
- [ ] `terrain-zones.js` et `goal-cage-zones.js` ne sont pas modifiés (diff vide avec l'export) — toute logique d'adaptation de format vit dans `screen-book.js` ou un petit module dédié, pas dans les fichiers vendor.

## Hors scope
- Heatmap continue plus fine que le découpage 11×9 zones (V2).
- Comparaison de plusieurs tireurs sur la même heatmap (V2).

## Dépend de
STORY-07a

## Taille
M
