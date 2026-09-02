# QA — STORY-04 : Écran Sélection / création tireur

## Critères validés ✅
- ✅ Écran vide (pas de recherche) : affiche les tireurs récemment consultés par ce gardien, max 5 — comportement conforme (dérivé des `impacts`, donc vide tant qu'aucun impact n'existe pour ce gardien, ce qui est le comportement attendu du design, pas un bug).
- ✅ Recherche filtre en temps réel (debounce ~200ms observé) sur nom + club.
- ✅ Tap sur un tireur → navigue vers l'écran suivant avec `state.tireurCourant` correctement peuplé.
- ✅ Aucun résultat exact → ligne "+ Créer '...'" apparaît, ouvre le mini-formulaire inline.
- ✅ Création avec nom seul fonctionne (poste `null` en base si non choisi) ; création avec club + latéralité fonctionne également (vérifié en relisant l'enregistrement créé).
- ✅ Après création, navigation directe comme pour un tireur existant.
- ✅ Une fois le tireur créé, une recherche exacte sur son nom ne propose plus "+ Créer" (correspondance exacte détectée) et affiche la ligne de sélection à la place.
- ✅ État erreur réseau géré (message + Réessayer), pas d'écran blanc.
- ✅ Bouton retour du header ramène à l'écran gardien.

## Bug trouvé et corrigé pendant le développement
- **Layout header** : le titre était poussé à l'extrême droite sur l'écran tireur (2 enfants flex en `space-between` sans regroupement). Corrigé par le Developer (`.header-left`) avant cette validation — revérifié visuellement, conforme à la maquette après correction.

## Cas limites testés
- Recherche puis retour à liste vide (`Aucun tireur consulté récemment`) après effacement du champ.
- Formulaire de création avec le nom pré-rempli depuis la recherche en cours.

## Régression
- Écran gardien (STORY-03) : la navigation post-sélection/création pointe maintenant vers `tireur` au lieu de `placeholder` — comportement intentionnel de cette story, pas une régression. Le reste du comportement de l'écran gardien (persistance, changer de gardien, états vide/erreur) non affecté.
- `js/vendor/*` et `css/zones.css` toujours identiques à l'export.

## Bugs trouvés (restants)
Aucun.

## Verdict
**PASSED**
