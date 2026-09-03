# STORY-13 — Écran Sélection Match

**En tant que** utilisateur qui veut documenter un match,
**Je veux** choisir un match existant dans une liste,
**Afin de** lancer directement la saisie avec les deux équipes déjà chargées.

## Contexte technique
- Zone concernée : nouveau `js/screens/screen-selection-match.js`, réutilise `getMatchs()` (STORY-12).
- Maquette : `docs/design/mode-match.md` — Écran Sélection Match.
- Sélection d'un match → charge `state.matchCourant` (id, saison, journée, les deux équipes avec leurs joueurs déjà résolus via `getJoueursByEquipe` pour les deux côtés) → `renderScreen("saisie-match")` (cible livrée en STORY-14a).

## Critères d'acceptation
- [ ] Liste des matchs existants avec journée/saison/deux équipes affichées, bouton "Lancer" par ligne.
- [ ] État vide (aucun match créé) : message invitant à aller en créer un dans Paramètres, avec lien direct.
- [ ] Au clic sur "Lancer", `state.matchCourant` contient toutes les données nécessaires à l'écran de saisie (pas de rechargement supplémentaire requis une fois sur l'écran suivant).
- [ ] Accessible depuis la carte "⚽ Saisir un match" de l'écran Accueil (STORY-09).

## Hors scope
- Filtrage/recherche dans la liste des matchs (liste simple suffit au volume attendu).

## Dépend de
STORY-12

## Taille
S
