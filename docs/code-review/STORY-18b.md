# Code Review — STORY-18b : Habillage visuel réaliste du but et du terrain

## Conformité architecture / document Visual
Diff conforme à `docs/arch/recentrage-match.md` et `docs/visual/recentrage-match.md` §1-3 :
- Nouveaux tokens (`--goal-post`, `--goal-post-stripe`, `--goal-net-line`, `--goal-shadow`, `--pitch-surround`, `--pitch-surround-line`, `--pitch-vignette`) repris à l'identique, aucun ne redéfinit un token possédé par `zones.css` (vérifié par grep : `--court-fill`, `--court-line`, `--court-line-dash`, `--court-goal`, `--bg3`, `--panel`, `--t3`, `--border`, `--fenix-sky` — 0 occurrence en redéfinition).
- `renderGoalZoneGrid()` appelée exactement comme avant (mêmes arguments), enveloppée dans `.goal-frame`/`.goal-frame-bar`/`.goal-frame-ground-shadow` — markup additionnel uniquement, aucune modification de `js/vendor/goal-cage-zones.js` (diff vide confirmé).
- Terrain : **aucun changement de markup** dans `screen-saisie-match.js` — `courtSvgMarkup()`/`renderCourtZonePicker()` intouchés, le cadrage s'obtient entièrement via CSS sur `.court-pick` existant, scopé à `.screen-saisie-match` pour ne pas affecter le `court-pick` du Book. `js/vendor/terrain-zones.js` et `css/zones.css` non touchés (diff vide confirmé).
- `.screen-saisie-match .court-pick::after` (vignette) porte bien `pointer-events: none`.

## Bug trouvé et corrigé — perte du dégradé radial du terrain
**Sévérité : Majeur (visuel).** La règle `.screen-saisie-match .court-pick` combinait `background: radial-gradient(...)` (raccourci, qui définit implicitement `background-image`) puis, plus loin dans la même règle, `background-image: repeating-linear-gradient(...)` (texture gazon). En CSS, la dernière déclaration d'une même propriété l'emporte — la texture gazon écrasait donc silencieusement le dégradé radial, qui ne s'affichait jamais. **Ce défaut existe déjà tel quel dans `docs/visual/recentrage-match.md` §3** (le document sépare les deux dans deux blocs de règles consécutifs sur le même sélecteur, ce qui produit exactement le même écrasement) — l'implémentation a fidèlement reproduit ce défaut de la spec plutôt que de l'introduire.

**Correction** : fusion des deux dans une unique déclaration `background-image` avec les deux dégradés en couches (`repeating-linear-gradient(...), radial-gradient(...)`), texture au-dessus du dégradé radial. Revérifié visuellement (capture) : la lueur verdâtre du dégradé radial est maintenant bien visible en haut du terrain, superposée à la texture gazon.

## Scope
Diff limité à `css/app.css` et `js/screens/screen-saisie-match.js`, conforme au périmètre de la story (les deux fichiers explicitement listés dans "Contexte technique"). Aucun fichier hors scope touché.

## Vérification des critères d'acceptation (lecture + vérification live du Developer)
- [x] Cage encadrée de poteaux rayés + barre transversale + texture filet visible (capture)
- [x] Sélection des 9 zones de cage fonctionne comme avant (`js/vendor/goal-cage-zones.js` non modifié, clic réel testé par le Developer)
- [x] Terrain entouré d'un cadrage visuel (marge, vignette, texture) sans modification de `terrain-zones.js`/`zones.css`
- [x] Aucun token possédé par `zones.css` redéfini
- [x] Hit-testing zones concaves préservé — zone `69MC` taguée avec succès par le Developer (clic réel, pas seulement programmatique, sur une zone non-concave également testée)
- [x] Éléments décoratifs (`::after` vignette) en `pointer-events:none` — vérifié, et clic réel traversant sans interception
- [x] Contrastes conformes à la checklist §6 — conforme par construction (mêmes valeurs de tokens que celles dont les ratios sont documentés par le Visual Crafter, aucune valeur modifiée)

## Note reportée par le Developer (hors scope, non traitée)
États `:hover` de `docs/visual/recentrage-match.md` §5 (`.player-btn`, `.gz-cell` en layout large) non couverts par cette story ni par STORY-18a — aucun critère d'acceptation ne les mentionne dans les deux stories. À signaler au Scrum Master pour décider si une story dédiée est nécessaire ou si c'est un oubli mineur à laisser de côté.

## Verdict
**APPROUVÉ** — un défaut de cascade CSS hérité de la spec elle-même a été détecté et corrigé dans le cadre de cette revue.
