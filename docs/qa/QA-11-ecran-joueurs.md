# QA — STORY-11 : Écran Joueurs (par équipe)

## Critères validés ✅
- ✅ Liste des joueurs de l'équipe courante (filtrée sur `equipe_id`), recherche client-side fonctionnelle.
- ✅ Création rapide pré-remplit `equipe_id` — le joueur créé apparaît immédiatement dans la liste sans rechargement manuel (vérifié : liste passée de 1 à 2 joueurs instantanément après création).
- ✅ Poste "Gardien de but" sélectionnable, confirmé présent dans les options du `<select>` des deux écrans (tireur libre ET joueur).
- ✅ `POSTES` et le formulaire de création ne sont plus dupliqués — un seul fichier source (`tireur-form-shared.js`), vérifié en lisant le code des deux écrans consommateurs.
- ✅ Le mode Book existant (recherche/création tireur libre, `equipe_id` null) continue de fonctionner à l'identique après le refactor — non-régression explicitement testée, pas supposée.
- ✅ Bouton retour ramène à l'écran Équipes.

## Cas limites testés
- Champ Club absent du formulaire joueur (contrairement au formulaire tireur libre) — confirmé.
- État d'erreur simulé sur le chargement des joueurs — bandeau + retry conformes.

## Régression
Aucune régression détectée sur le mode Book par tireur.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
