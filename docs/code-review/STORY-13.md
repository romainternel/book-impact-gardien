# Code Review — STORY-13 : Écran Sélection Match

## Conformité Architecture
- `state.matchCourant` construit entièrement au clic sur "Lancer" (deux équipes + leurs joueurs déjà résolus via `getJoueursByEquipe` en parallèle) — conforme à l'intention de la story : STORY-14a n'aura aucun chargement à faire à son montage. ✅

## Réutilisation vs duplication
- Réutilise `getMatchs()`/`getJoueursByEquipe()` telles quelles, aucune nouvelle fonction `api.js` nécessaire pour cette story.

## Scope
- Fichiers touchés : `js/screens/screen-selection-match.js` (nouveau), `index.html`, `css/app.css` (2 règles). Conforme.

## Lisibilité et maintenabilité
- Le bouton "Lancer" se désactive et affiche "…" pendant le chargement des joueurs, avec restauration en cas d'échec — petit détail de robustesse non demandé explicitement par la story mais cohérent avec l'esprit du projet (éviter un double-clic pendant un appel asynchrone), sans complexité excessive.

## Gestion d'erreurs
- Échec du chargement des joueurs au clic "Lancer" : le bouton se réactive plutôt que de laisser l'utilisateur bloqué sur un état "…" permanent — bon réflexe, bien que non testé explicitement en E2E (cf. note QA).

## Sécurité basique
Rien de nouveau.

## Taille et complexité
Story S conforme.

## Point vérifié en conditions réelles
Liste réelle (3 matchs de test), clic "Lancer" → `state.matchCourant` correctement peuplé avec les deux équipes et leurs rosters respectifs (2 joueurs côté équipe A, 0 côté équipe B — cohérent avec les données de test existantes). États vide et erreur simulés conformes.

## Verdict
**APPROUVÉ**
