# Code Review — STORY-11 : Écran Joueurs (par équipe)

## Conformité Architecture
- Refactor anti-duplication exécuté exactement comme recommandé (`docs/arch/mode-match.md` §6) : `tireur-form-shared.js` extrait `POSTES`, `posteLabel`, le markup du formulaire et la lecture des champs — un seul point de vérité pour `screen-tireur.js` et `screen-joueurs.js`. ✅
- `createTireur()` étendu avec `equipe_id` optionnel, rétrocompatible (défaut `null`) — signature conforme à `docs/arch/mode-match.md` §5. ✅
- `getJoueursByEquipe()` conforme (tireurs filtrés par `equipe_id`, triés par nom). ✅

## Réutilisation vs duplication
- Zéro duplication du tableau `POSTES` (désormais 7 valeurs) entre les deux écrans — vérifié en lisant les deux fichiers, aucun des deux ne redéclare `POSTES`.
- `renderCreateTireurForm(opts)` paramétrée (`showClub`, `submitLabel`, `prefillNom`) plutôt que deux implémentations proches — les deux écrans consommateurs restent lisibles sans dupliquer le HTML du formulaire.

## Scope
- Fichiers touchés : `js/screens/tireur-form-shared.js` (nouveau), `js/screens/screen-tireur.js` (refactor, pas de changement de comportement), `js/screens/screen-joueurs.js` (nouveau), `js/api.js` (2 fonctions), `index.html`. Conforme.

## Lisibilité et maintenabilité
- `screen-joueurs.js` reste volontairement plus simple que `screen-tireur.js` (filtrage client-side, pas de debounce serveur) — décision cohérente avec le volume attendu par équipe (documentée dans le commentaire d'en-tête), pas une simplification hasardeuse.

## Gestion d'erreurs
- Pattern identique aux écrans existants (état `error` + retry) dans les deux écrans touchés.

## Sécurité basique
Rien de nouveau — `tireurs` déjà auditée en STORY-02/08 (`equipe_id` est une colonne supplémentaire sur une table déjà couverte par les policies existantes, pas une nouvelle ressource).

## Taille et complexité
Story M conforme — le refactor ajoute de la valeur (élimine une duplication déjà identifiée) sans complexité excessive.

## Point vérifié en conditions réelles
- **Non-régression du mode Book** : recherche + création tireur libre testées après le refactor, `equipe_id: null` confirmé sur le tireur créé, navigation vers l'écran de saisie inchangée.
- **Écran Joueurs** : liste filtrée par équipe (le joueur de test STORY-08 apparaît avec son poste "Gardien de but"), champ Club absent du formulaire (`showClub: false` respecté), création d'un joueur avec latéralité → apparaît immédiatement dans la liste sans rechargement (conforme à l'AC), `equipe_id` correct en base.
- Recherche client-side et état d'erreur simulé conformes.

## Verdict
**APPROUVÉ**
