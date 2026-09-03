# STORY-11 — Écran Joueurs (par équipe)

**En tant que** utilisateur qui vient de sélectionner une équipe,
**Je veux** lister et créer rapidement les joueurs de cette équipe,
**Afin de** préparer le roster nécessaire à la saisie d'un match.

## Contexte technique
- Zone concernée : nouveau `js/screens/screen-joueurs.js`, `js/api.js` (`getJoueursByEquipe(equipeId)`), extension de `createTireur()` pour accepter `equipe_id` optionnel (cf. `docs/arch/mode-match.md` §5 — signature étendue, rétrocompatible).
- **Refactor anti-duplication recommandé par l'Architect** (`docs/arch/mode-match.md` §6) : extraire `POSTES` et le markup du mini-formulaire de création (nom/club/poste/latéralité) dans une fonction partagée, réutilisée par `screen-tireur.js` (STORY-04, à adapter a minima) et ce nouvel écran — éviter la duplication du tableau `POSTES` (désormais 7 valeurs avec `gardien_but`) à deux endroits.
- Maquette : `docs/design/mode-match.md` — Écran Joueurs.

## Critères d'acceptation
- [ ] Liste des joueurs de l'équipe courante (`tireurs` filtré sur `equipe_id`), recherche client-side (volume faible par équipe, pas besoin d'une requête serveur comme pour la recherche tireur libre).
- [ ] Création rapide pré-remplit `equipe_id` avec l'équipe courante — le joueur créé apparaît immédiatement dans la liste sans rechargement manuel.
- [ ] Le poste "Gardien de but" est sélectionnable (nouvelle valeur du référentiel, cf. STORY-08).
- [ ] `POSTES` et le formulaire de création ne sont plus dupliqués entre `screen-tireur.js` et `screen-joueurs.js` — un seul point de vérité.
- [ ] Le mode Book existant (recherche/création tireur libre, `equipe_id` null) continue de fonctionner à l'identique après le refactor — non-régression explicite à vérifier.
- [ ] Bouton retour ramène à l'écran Équipes.

## Hors scope
- Édition d'un joueur existant (Should Have du PRD, pas cette story).
- Rattachement a posteriori d'un tireur libre existant à une équipe (hors scope explicite, cf. `docs/risks/mode-match.md` edge case).

## Dépend de
STORY-08, STORY-10

## Taille
M
