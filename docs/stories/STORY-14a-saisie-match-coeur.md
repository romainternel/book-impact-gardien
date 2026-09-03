# STORY-14a — Écran Saisie Match : boucle cœur

**En tant que** utilisateur qui documente un match complet,
**Je veux** taguer chaque tir (résultat simplifié, position, joueur des deux équipes) en quelques taps,
**Afin de** construire une trace complète du match sans ralentir le visionnage.

## Contexte technique
- Zone concernée : nouveau `js/screens/screen-saisie-match.js`.
- Maquette et logique d'enchaînement : `docs/design/mode-match.md` — Écran Saisie Match. Réutilise **tel quel** `zone-picker.js` (terrain) et `renderGoalZoneGrid` (cage) — mêmes composants que `screen-impact.js` (STORY-06a), aucune modification de ces fichiers.
- Résultat à 2 valeurs (`but` / `non_but`) — variante du composant résultat existant (`.result-btn`, cf. `docs/visual/mode-match.md` §3), pas les 4 valeurs du mode Book.
- `non_but` se comporte comme `hors_cadre` : pas de zone de cage requise (cf. `docs/arch/mode-match.md` §3).
- Deux listes de boutons joueurs (une par équipe, `state.matchCourant.equipeA.joueurs` / `equipeB.joueurs`), stylées avec `.team-roster`/`.player-btn` (`docs/visual/mode-match.md` §4). Taper un joueur détermine à la fois qui a tiré et pour quelle équipe.
- **Mitigation du risque #1** (`docs/risks/mode-match.md`) : ajouter `non_but: "Non-but"` à la table de labels de résultat existante (partagée avec `resultatLabel()` de `screen-impact.js` — étendre ce tableau plutôt qu'en créer un second) et la classe CSS `.badge-non_but` dans `app.css`, pour un affichage correct dans le Book.
- Enregistrement : `createImpact()` réutilisée telle quelle, payload avec `match_id` en plus de `gardien_id`/`tireur_id`/`zone_tir`/`resultat`/`zone_cage`.

## Critères d'acceptation
- [ ] Un tir `non_but` s'enregistre dès que Résultat + Zone de tir + Joueur sont réunis (pas de zone de cage requise) — équivalent du flow 2-taps-zones existant, plus le tap joueur.
- [ ] Un tir `but` s'enregistre dès que Résultat + Zone de tir + Zone de cage + Joueur sont réunis.
- [ ] Taper un joueur de l'équipe A puis un joueur de l'équipe B (changement d'avis) remplace correctement la sélection précédente, un seul joueur actif à la fois tous côtés confondus.
- [ ] Aucun enregistrement ne se déclenche tant que le joueur n'est pas sélectionné, même si résultat + zones sont déjà réunis (le joueur est requis, contrairement à type_tir/main sur l'écran existant qui restent optionnels).
- [ ] L'impact créé contient `match_id` correct, `gardien_id` = gardien actif (l'observateur), `tireur_id` = le joueur tapé.
- [ ] Un impact `non_but` créé en mode Match apparaît dans le Book du joueur concerné (`screen-book.js`, déjà livré) avec un badge "Non-but" correctement coloré (pas le texte brut "non_but") — critère explicite issu du risque #1.
- [ ] Un impact `but` créé en mode Match apparaît dans le Book du joueur avec sa zone de tir/cage correcte, et compte bien dans les heatmaps existantes (STORY-07b) sans modification de ces fichiers.

## Hors scope
- Verrouillage anti double-tap, bandeau d'erreur explicite, annulation (STORY-14b).
- Pré-remplissage type_tir/main (non demandé pour ce mode, le PRD ne le prévoit pas — champs absents de cet écran).

## Dépend de
STORY-08, STORY-11, STORY-13, STORY-05

## Taille
L
