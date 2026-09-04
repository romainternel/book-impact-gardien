# QA — STORY-17 : Simplification du flow "Book par tireur"

## Méthode
Revue fonctionnelle par traçage de code (app statique sans build, comportement 100% déterministe à partir du DOM/JS) + vérification contre des données réelles de production via l'API REST Supabase (mêmes credentials publics que `js/config.js`). L'interaction UI réelle en navigateur est laissée à l'E2E Tester (Playwright, étape suivante).

## Critères validés ✅
- ✅ Sélectionner un tireur existant depuis "Book par tireur" → `state.tireurCourant` assigné puis `renderScreen("book")` (`screen-tireur.js:85`) — affiche directement le Book, plus l'ancien écran de saisie.
- ✅ Créer un nouveau tireur → même mécanisme (`screen-tireur.js:152`) → Book vide (aucun tir), `s.impacts.length === 0` déclenche l'état vide attendu.
- ✅ Bouton retour du header du Book → `back: "tireur"` (`screen-book.js:176`) → renvoie à l'écran Tireur.
- ✅ Bouton de l'état vide du Book → `data-action="back-to-tireur"`, libellé "Retour", handler `renderScreen("tireur")` (`screen-book.js:185`, `screen-book.js:209-212`).
- ✅ `js/screens/screen-impact.js` n'existe plus dans le dépôt ; balise `<script>` retirée d'`index.html`.
- ✅ Recherche exhaustive de `renderScreen("impact")`, `data-action="back-to-impact"`, `registerScreen("impact"` dans tout `js/` → 0 occurrence (reconfirmé indépendamment du Code Reviewer).
- ✅ **Badge des impacts historiques (risque P0 du Risk Analyst)** — vérifié avec de vraies données de production : le tireur "11" (id `441c8ba3-...`) possède un impact réel avec `resultat = "arret"` (requête directe sur `/rest/v1/impacts`). `resultatLabel()` et `RESULTAT_OPTIONS` sont désormais définis dans `screen-book.js` avec un contenu strictement identique à l'original de `screen-impact.js` (diff de déplacement, aucune valeur modifiée) ; `renderHistoriqueRow()` les appelle exactement comme avant. Le badge affichera "Arrêt", pas d'erreur `resultatLabel is not defined`.
- ✅ Aucune régression sur recherche/création/édition/suppression tireur (STORY-04/15/16) : ces fonctions ne sont touchées par aucune ligne du diff — seule la destination de navigation post-sélection/création a changé.

## Cas limites testés
- Book vide (tireur sans aucun impact) : état vide correctement affiché avec le nouveau bouton "Retour" → écran Tireur (pas de dépendance à l'ancien écran supprimé).
- Tireur avec impact historique `resultat` hors `but`/`non_but` (données mode Book pré-mode-Match) : couvert ci-dessus avec données réelles.

## Bugs trouvés
Aucun.

## Régressions détectées
Aucune.

## Verdict
**PASSED**
