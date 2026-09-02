# STORY-06a — Écran Saisie impact : boucle cœur

**En tant que** gardien en train de visionner une vidéo de match,
**Je veux** taguer un tir en 2-3 taps (résultat, zone de tir, zone de cage si nécessaire) avec enregistrement immédiat,
**Afin de** ne jamais perdre le fil du visionnage pour une saisie.

## Contexte technique
- Zone concernée : `js/screens/screen-impact.js`.
- Maquette et logique d'enchaînement exactes : `docs/design/book-impact-gardien.md` — Écran 3, section "Décision UX structurante".
- Compose : 4 boutons résultat (nouveau, styles `docs/visual/book-impact-gardien.md` §1 couleurs `--res-*`) + `zone-picker.js` (STORY-05) pour la zone de tir + `renderGoalZoneGrid()` de `goal-cage-zones.js` (réutilisé tel quel, déjà le picker) pour la zone de cage + chips type/main.
- Logique d'activation : la grille cage est visuellement grisée (`opacity:.35; pointer-events:none`) tant que le résultat choisi n'est pas `but`/`arret`/`poteau`.
- Logique d'enregistrement automatique (pas de bouton "Valider") :
  - `hors_cadre` complet dès que Résultat + Zone de tir sont renseignés → appelle `createImpact()`.
  - `but`/`arret`/`poteau` complet dès que Résultat + Zone de tir + Zone de cage sont renseignés → appelle `createImpact()`.
- `type_tir`/`main` : préremplis via `getLastImpact(gardienId, tireurId)` au chargement de l'écran pour ce tireur ; un tap sur un chip change juste la valeur préremplie, ne déclenche pas d'enregistrement seul.
- Après enregistrement réussi : Résultat/Zone de tir/Zone de cage reviennent à "aucune sélection" ; type/main restent sur leur dernière valeur.

## Critères d'acceptation
- [ ] Un tir `hors_cadre` s'enregistre en 2 taps exactement (résultat + zone de tir), sans tap supplémentaire requis.
- [ ] Un tir `but`/`arret`/`poteau` s'enregistre en 3 taps exactement (résultat + zone de tir + zone de cage), ordre libre entre résultat et zone de tir.
- [ ] Taper la zone de cage avant d'avoir choisi un résultat compatible n'a aucun effet (grille visuellement grisée et non cliquable).
- [ ] Changer de résultat après avoir déjà sélectionné une zone de cage, vers `hors_cadre`, retire la sélection de cage (elle n'a plus de sens) sans déclencher d'enregistrement invalide.
- [ ] L'impact enregistré contient bien `gardien_id`, `tireur_id`, `zone_tir`, `zone_cage` (ou null si `hors_cadre`), `resultat`, `type_tir`, `main` — vérifié par lecture directe en base après un tap de test.
- [ ] Après enregistrement, l'écran revient à l'état "prêt pour le tir suivant" en moins de 100ms (pas d'attente perceptible), type/main conservés.
- [ ] Le lien "📖 Book" du header est présent et navigue vers l'écran Book du tireur courant (STORY-07a, même si la cible n'est pas encore livrée — prévoir la route).

## Hors scope
- Verrouillage anti double-tap, gestion d'erreur d'écriture, bandeau + bouton "Annuler dernier impact" (STORY-06b).
- Édition d'un impact autre que via l'annulation (hors scope produit, cf. PRD).

## Dépend de
STORY-02, STORY-04, STORY-05

## Taille
L
