# Code Review — STORY-10 : Écrans Paramètres et Équipes

## Conformité Architecture
- `getEquipes()`/`createEquipe()` conformes à `docs/arch/mode-match.md` §5. `screen-equipes.js` reprend fidèlement le pattern déjà établi (`screen-gardien.js`) plutôt que d'inventer une nouvelle structure — cohérent avec "je ne réinvente pas ce qui existe déjà". ✅

## Réutilisation vs duplication
- `.mode-card`/`.list-card`/`.inline-create`/`.skeleton-list`/`.empty-state` tous réutilisés sans aucun ajout CSS pour cette story — bon signal que le design system posé depuis STORY-03/09 tient la charge.

## Scope
- Fichiers touchés : `js/screens/screen-parametres.js`, `js/screens/screen-equipes.js` (nouveaux), `js/api.js` (2 fonctions), `js/state.js` (2 champs), `index.html`. Conforme à la story — "Joueurs"/"Matchs" pointent vers des écrans absents, comportement de fallback assumé et documenté.

## Lisibilité et maintenabilité
- `state.equipeCourante` posé dès `state.js` (avec `matchCourant` en anticipation de STORY-13/14a) plutôt que découvert implicitement — cohérent avec la convention déjà en place de déclarer tous les champs d'état à l'avance.

## Gestion d'erreurs
- Pattern identique à `screen-gardien.js` : état `error` avec retry, aucune exception non gérée.

## Sécurité basique
Rien de nouveau — `equipes` déjà auditée en STORY-08 (`select`/`insert` uniquement, cohérent avec ce que cette story exerce).

## Taille et complexité
Story M conforme.

## Point vérifié en conditions réelles
Liste réelle (2 équipes de test STORY-08), création d'une nouvelle équipe → `state.equipeCourante` correctement peuplée → navigation vers `joueurs` (fallback routeur attendu, STORY-11 pas encore livrée). Sélection d'une équipe existante testée séparément avec le même résultat. État d'erreur simulé conforme.

## Verdict
**APPROUVÉ**
