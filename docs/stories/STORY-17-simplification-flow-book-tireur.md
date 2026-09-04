# STORY-17 — Simplification du flow "Book par tireur"

**En tant que** gardien qui consulte le book d'un tireur,
**Je veux** arriver directement sur son Book en le sélectionnant depuis "Book par tireur",
**Afin de** ne plus passer par un écran de saisie que je n'utilise plus (toute la saisie se fait désormais via le mode Match).

## Contexte technique
- Zone concernée : `js/screens/screen-tireur.js` (navigation), `js/screens/screen-book.js` (bouton retour + relocalisation de code), `js/screens/screen-impact.js` (supprimé), `index.html` (retrait de la balise `<script>`).
- Nouvelles structures : aucune.
- Impact sur l'existant :
  - `screen-tireur.js` : les deux appels `renderScreen("impact")` (sélection d'un tireur existant, création d'un nouveau tireur) deviennent `renderScreen("book")`. `state.tireurCourant` reste assigné avant l'appel, inchangé.
  - `screen-book.js` : l'option `back` du header passe de `"impact"` à `"tireur"`. Le bouton de l'état vide (aucun impact) passe de `data-action="back-to-impact"` / libellé "Retour à la saisie" à `data-action="back-to-tireur"` / libellé "Retour", avec `renderScreen("tireur")`.
  - `screen-book.js` reçoit **en plus** de son contenu actuel les constantes `RESULTAT_OPTIONS` et la fonction `resultatLabel()`, déplacées telles quelles depuis `screen-impact.js` (placées en tête de fichier, à côté de `ZONE_TIR_GROUPS`) — nécessaires pour afficher correctement le badge des impacts historiques (`arret`/`poteau`/`hors_cadre` en plus de `but`/`non_but`).
  - `screen-impact.js` : fichier supprimé entièrement (y compris `TYPE_TIR_OPTIONS` et `isResultatCadre()`, non utilisés ailleurs — vérifié, pas relocalisés).
  - `index.html` : suppression de la ligne `<script src="js/screens/screen-impact.js"></script>`.

## Critères d'acceptation
- [ ] Sélectionner un tireur existant depuis "Book par tireur" affiche directement son Book (pas l'ancien écran de saisie impact).
- [ ] Créer un nouveau tireur depuis "Book par tireur" affiche directement son Book (vide, aucun tir).
- [ ] Le bouton retour du header de l'écran Book renvoie à l'écran Tireur (recherche/sélection).
- [ ] Le bouton de l'état vide du Book ("Retour") renvoie à l'écran Tireur, avec le nouveau libellé.
- [ ] `js/screens/screen-impact.js` n'existe plus dans le dépôt, et sa balise `<script>` n'est plus dans `index.html`.
- [ ] Aucune occurrence résiduelle de `renderScreen("impact")` ou `data-action="back-to-impact"` dans tout `js/` (recherche exhaustive, pas seulement les points déjà identifiés).
- [ ] Le Book d'un tireur possédant un impact historique avec `resultat = arret`, `poteau` ou `hors_cadre` affiche le bon libellé de badge (pas d'erreur console, pas de libellé brut non traduit).
- [ ] Aucune régression sur la recherche, la création, l'édition et la suppression de tireur (STORY-04/15/16) — ces flux ne sont pas touchés par cette story.

## Hors scope
- Toute modification de `screen-saisie-match.js` ou du mode Match (cf. STORY-18a/STORY-18b).
- Toute modification du schéma Supabase.

## Dépend de
Aucune.

## Taille
S
