# STORY-18b — Habillage visuel réaliste du but et du terrain

**En tant que** gardien qui documente un match en direct,
**Je veux** que la zone de cage ressemble à un vrai but de handball et que le terrain soit visuellement plus riche qu'aujourd'hui,
**Afin de** avoir un écran de saisie agréable à regarder pendant un visionnage prolongé, sans changer la façon de taguer un tir.

## Contexte technique
- Zone concernée : `css/app.css` (nouveaux tokens et classes), `js/screens/screen-saisie-match.js` (markup décoratif additionnel autour des appels existants à `renderGoalZoneGrid()` et `courtSvgMarkup()`/`renderCourtZonePicker()`).
- Nouvelles structures : nouveaux tokens CSS (`--goal-post`, `--goal-post-stripe`, `--goal-net-line`, `--goal-shadow`, `--pitch-surround`, `--pitch-surround-line`, `--pitch-vignette`) — spec exacte dans `docs/visual/recentrage-match.md`.
- Impact sur l'existant :
  - Cage : `renderGoalZoneGrid()` (vendor, `js/vendor/goal-cage-zones.js`) est appelée **exactement comme avant**, sans modification de ses arguments ni de son code. Elle est enveloppée dans un nouveau conteneur `.goal-frame` (poteaux via `::before`/`::after`, barre transversale via `.goal-frame-bar`, texture de filet en `background-image` derrière `.goal-zone-grid.gz-big`).
  - Terrain : `courtSvgMarkup()` et `renderCourtZonePicker()` (vendor, `js/vendor/terrain-zones.js`, `js/zone-picker.js`) appelées **exactement comme avant**. Le réalisme s'obtient en ajoutant `padding` et un fond/vignette sur `.court-pick` depuis `app.css` — le SVG (`inset:0`) se recale automatiquement dans cette marge, sans aucun changement de sa géométrie ni de son `viewBox`.
  - **Aucune modification** de `js/vendor/terrain-zones.js`, `js/vendor/goal-cage-zones.js`, ni `css/zones.css` — le diff avec `fenix-terrain-zones-export/` doit rester vide.
  - **Aucune redéfinition** des tokens possédés par `zones.css` (`--court-fill`, `--court-line`, `--court-line-dash`, `--court-goal`, `--bg3`, `--panel`, `--t3`, `--border`, `--fenix-sky`) — règle déjà affichée en tête d'`app.css`, à respecter.

## Critères d'acceptation
- [ ] La zone de cage est visuellement encadrée de poteaux (bandes verticales rayées) et d'une barre transversale, avec une texture de filet visible en arrière-plan de la grille de sélection existante.
- [ ] La sélection d'une des 9 zones de la cage (tap sur une cellule) fonctionne exactement comme avant — aucune modification de `js/vendor/goal-cage-zones.js`.
- [ ] Le terrain est entouré d'un cadrage visuel (marge, vignette, texture discrète) qui l'ancre visuellement comme un terrain réel, sans modification de `js/vendor/terrain-zones.js` ni `css/zones.css`.
- [ ] Aucun des tokens `--court-fill`, `--court-line`, `--court-line-dash`, `--court-goal`, `--bg3`, `--panel`, `--t3`, `--border`, `--fenix-sky` n'est redéfini dans le diff de cette story.
- [ ] Le hit-testing des 11 zones du terrain (notamment les zones concaves `69MG`/`69MC`/`69MD`) reste précis après ajout du cadrage décoratif — vérifié par un tap réel proche du bord intérieur d'une de ces zones.
- [ ] Les éléments décoratifs superposés au SVG (vignette) ont `pointer-events: none` — aucun ne peut intercepter un tap destiné à une zone.
- [ ] Contrastes vérifiés conformes à la checklist du Visual Crafter (`docs/visual/recentrage-match.md` §6).

## Hors scope
- Réordonnancement/layout de l'écran (cf. STORY-18a, doit être livrée en premier — cette story a besoin des conteneurs `.goal-frame`/`.saisie-match-center` en place).
- Toute nouvelle micro-animation au-delà des états hover déjà spécifiés dans le document Visual.
- Toute modification du comportement de saisie (auto-enregistrement, verrouillage, annulation).

## Dépend de
STORY-18a (structure/layout doit être en place avant d'y appliquer l'habillage visuel).

## Taille
M
