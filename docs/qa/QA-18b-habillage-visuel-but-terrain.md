# QA — STORY-18b : Habillage visuel réaliste du but et du terrain

## Méthode
Test en navigateur réel (Playwright) contre le backend de production, sur le vrai match "J01 · BILLERE vs FENIX". Vérification du hit-testing par calcul de coordonnées exactes (transformation `SVGPoint` via `getScreenCTM()` + `document.elementFromPoint()`), pas seulement par clic sur l'élément décrit par son sélecteur — pour tester réellement la précision au pixel près près des bords, conformément à l'exigence explicite de la story.

## Critères validés ✅
- ✅ Cage visuellement encadrée : poteaux rayés rouge/blanc (`::before`/`::after`), barre transversale, texture de filet visible en arrière-plan de la grille — conforme à la capture.
- ✅ Sélection des 9 zones de cage fonctionne comme avant : cellule "HG" (coin, la plus proche du poteau) cliquée avec succès, impact réel créé en base avec `zone_cage:"HG"`.
- ✅ Terrain entouré d'un cadrage visuel (marge, dégradé radial + texture gazon, vignette) — **le bug de dégradé radial manquant (trouvé par le Code Reviewer) a été revérifié corrigé** : la lueur verte est bien visible en haut du terrain sur la capture.
- ✅ Aucun token possédé par `zones.css` redéfini (revérifié indépendamment par grep).
- ✅ **Hit-testing précis aux bords des zones concaves** — test le plus rigoureux de cette story : calcul direct des coordonnées écran via `getScreenCTM()` pour deux points séparés de seulement 2 unités de viewBox de part et d'autre de la frontière entre les zones concaves `69MC` et `69MG` (les deux zones les plus sensibles documentées dans `CLAUDE.md` §8). `document.elementFromPoint()` résout correctement `69MC` d'un côté et `69MG` de l'autre, avec le nouveau cadrage/padding en place — aucune dégradation de précision.
- ✅ Poteau (élément décoratif `::before` du `.goal-frame`) n'intercepte pas le clic sur la cellule de cage adjacente ("HG", testée à 2px de son bord gauche, juste à côté du poteau) — confirmé après avoir noté et corrigé une fausse alerte initiale due à l'état `cage-locked` (comportement normal tant que "But" n'est pas sélectionné, sans rapport avec cette story).
- ✅ Vignette du terrain (`::after`, `pointer-events:none`) ne bloque aucun clic — confirmé par clic réel (coordonnées, pas `dispatchEvent`) sur une zone du terrain en STORY-18a déjà, comportement inchangé ici puisque le terrain n'a reçu aucune modification de markup.
- ✅ Contrastes : conforme par construction, valeurs de tokens identiques à celles documentées par le Visual Crafter (`docs/visual/recentrage-match.md` §6).
- ✅ Cycle complet réel (cage "HG" → terrain "9MD" → joueur "27") : auto-save fonctionnel, impact créé en base, supprimé après vérification.

## Cas limites testés
- Frontière exacte entre deux zones concaves adjacentes (`69MC`/`69MG`), à 2 unités de viewBox d'écart seulement — cas le plus défavorable possible pour un hit-testing dégradé par l'ajout du cadrage décoratif.
- Cellule de cage au coin (la plus proche géométriquement du poteau décoratif).

## Bugs trouvés
Aucun nouveau (le bug de dégradé radial manquant avait déjà été détecté et corrigé par le Code Reviewer avant cette passe QA — revérifié ici, confirmé résolu).

## Régressions détectées
Aucune. Deux impacts de test créés pendant les vérifications (Developer + QA) supprimés après coup.

## Verdict
**PASSED**
