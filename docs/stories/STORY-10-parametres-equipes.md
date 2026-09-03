# STORY-10 — Écrans Paramètres et Équipes

**En tant que** utilisateur qui veut structurer son suivi,
**Je veux** un hub Paramètres et pouvoir créer/lister des équipes,
**Afin de** préparer les référentiels nécessaires au mode Match.

## Contexte technique
- Zone concernée : nouveaux `js/screens/screen-parametres.js`, `js/screens/screen-equipes.js`, `js/api.js` (`getEquipes()`, `createEquipe(nom)`).
- Maquette : `docs/design/mode-match.md` — Écrans Paramètres et Équipes.
- Style de carte du hub Paramètres : `.mode-card` (docs/visual/mode-match.md §2), réutilisé du pattern Accueil (STORY-09) plutôt que recréé.
- La création d'équipe reprend exactement le pattern de création rapide déjà établi (`start-create` / `confirm-create`, cf. `screen-gardien.js`) — nom obligatoire uniquement.

## Critères d'acceptation
- [ ] Hub Paramètres : 3 cartes (Équipes / Joueurs / Matchs) — "Joueurs" et "Matchs" peuvent temporairement pointer vers le fallback routeur tant que STORY-11/12 ne sont pas livrées.
- [ ] Écran Équipes : liste triée par nom, création inline (nom obligatoire), sélection d'une équipe navigue vers `renderScreen("joueurs")` avec `state.equipeCourante` renseigné (cible livrée en STORY-11, fallback acceptable en attendant).
- [ ] États vide/erreur gérés (même pattern que `screen-gardien.js`).
- [ ] Bouton retour du header ramène au hub Paramètres (depuis Équipes) et à l'écran Accueil (depuis Paramètres).

## Hors scope
- Édition/suppression d'une équipe (hors scope PRD).
- Contenu de l'écran Joueurs et Matchs (stories suivantes).

## Dépend de
STORY-08, STORY-09

## Taille
M
