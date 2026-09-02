# QA — STORY-06a : Écran Saisie impact, boucle cœur

## Critères validés ✅
- ✅ Tir `hors_cadre` enregistré en **2 taps exactement** (résultat + zone de tir) — vérifié par lecture directe de la ligne créée en base (`zone_cage: null`, `resultat: "hors_cadre"`).
- ✅ Tir `but`/`arrêt` enregistré en **3 taps exactement** (résultat + zone de tir + zone de cage), ordre libre entre résultat et zone de tir — vérifié dans les deux ordres.
- ✅ Taper la zone de cage avant d'avoir choisi un résultat compatible n'a aucun effet (grille grisée, `pointer-events:none` — pas de tentative d'enregistrement prématuré observée, compte d'impacts inchangé).
- ✅ Changer de résultat vers `hors_cadre` après avoir déjà sélectionné une zone de cage retire cette sélection sans déclencher d'enregistrement invalide (vérifié : `zoneCage` repasse à `null`, aucun impact créé avec des champs incohérents).
- ✅ L'impact enregistré contient bien tous les champs attendus (`gardien_id`, `tireur_id`, `zone_tir`, `zone_cage` ou `null`, `resultat`, `type_tir`, `main`) — vérifié par lecture directe en base à deux reprises (un `but` complet, un `hors_cadre`).
- ✅ Après enregistrement, retour à l'état "prêt pour le tir suivant" quasi instantané, `type_tir`/`main` conservés d'un enregistrement à l'autre.
- ✅ Lien "📖 Book" présent et route vers l'écran `book` — cible pas encore livrée (STORY-07a), fallback "introuvable" du routeur s'affiche comme attendu, pas un bug.

## Cas limites testés
- Préremplissage `type_tir`/`main` depuis `getLastImpact` à la réouverture de l'écran pour un tireur ayant déjà un historique — fonctionne (`jet`/`D` correctement restaurés).
- Aucun tireur sélectionné (accès direct à l'écran sans passer par `screen-tireur`) : message "Aucun tireur sélectionné" plutôt qu'un plantage — comportement défensif présent bien que non explicitement testé en conditions de navigation réelles (state manipulé directement).

## Visuel
Conforme à `docs/design/book-impact-gardien.md` Écran 3 et aux tokens couleur de `docs/visual/book-impact-gardien.md` (couleurs sémantiques par résultat, cage visuellement grisée quand verrouillée). Capture inspectée à l'écran.

## Régression
- Écran tireur (STORY-04) : navigation post-sélection/création pointe maintenant vers `impact` — changement intentionnel, reste du comportement de l'écran non affecté.
- Composant `zone-picker.js` (STORY-05) réutilisé sans modification, comportement de hit-testing toujours correct dans ce nouveau contexte d'usage.
- `js/vendor/*` et `css/zones.css` toujours identiques à l'export.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
