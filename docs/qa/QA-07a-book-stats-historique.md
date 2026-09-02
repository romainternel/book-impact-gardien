# QA — STORY-07a : Book tireur, stats et historique

## Critères validés ✅
- ✅ Les 4 cartes stats affichent nb tirs, % main dominante, zone favorite, taux d'arrêt du gardien actif — vérifiées avec un jeu de données réel (7 impacts), tous les chiffres exacts (71% Main D, "Aile D", 40%).
- ✅ Avec moins de 3 tirs, les stats main dominante/zone favorite affichent "Pas assez de données".
- ✅ Avec zéro tir, état vide avec bouton "Retour à la saisie" plutôt qu'un calcul sur échantillon vide.
- ✅ Historique trié du plus récent au plus ancien, badges colorés par résultat, `zone_cage` affichée uniquement si présente (les tirs `hors_cadre` affichent juste la zone de tir).
- ✅ Le taux d'arrêt exclut bien `poteau` et `hors_cadre` du calcul (vérifié : dénominateur = 5 sur 7 impacts, correspondant exactement aux 5 `but`/`arret`).
- ✅ Erreur réseau gérée (message + Réessayer).

## Cas limites testés
- Tireur sans club/poste/latéralité renseignés : le header ne casse pas, affiche juste le nom (logique déjà présente, pas re-testée spécifiquement pour cette story mais la construction du titre filtre les valeurs vides).

## Note transmise par le Code Reviewer
L'interprétation de "poste favori" (dérivé de `zone_tir` regroupée, pas du champ `tireurs.poste` statique) est une décision produit non explicitement validée par le PM en amont. Je la valide comme raisonnable et cohérente avec le reste du produit, mais je relaie la recommandation : à confirmer avec l'utilisateur final à l'usage réel de l'app.

## Régression
- Écran saisie impact (STORY-06a/06b) : lien "📖 Book" fonctionne maintenant réellement (plus de fallback "introuvable").
- `js/vendor/*` et `css/zones.css` toujours identiques à l'export.

## Bugs trouvés
Aucun.

## Verdict
**PASSED WITH NOTES** (note produit sur "poste favori", non bloquante)
