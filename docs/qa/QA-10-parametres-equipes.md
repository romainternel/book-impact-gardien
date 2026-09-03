# QA — STORY-10 : Écrans Paramètres et Équipes

## Critères validés ✅
- ✅ Hub Paramètres : 3 cartes, "Équipes" fonctionnelle, "Joueurs"/"Matchs" affichent le fallback routeur attendu.
- ✅ Écran Équipes : liste triée par nom (2 équipes de test affichées correctement), création inline fonctionnelle (nom obligatoire), sélection navigue avec `state.equipeCourante` correctement peuplé dans les deux cas (équipe nouvellement créée et équipe existante).
- ✅ États vide/erreur gérés (pattern `screen-gardien.js`).
- ✅ Bouton retour : Équipes → Paramètres → Accueil, chaîne cohérente.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
