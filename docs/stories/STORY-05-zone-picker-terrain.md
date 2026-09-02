# STORY-05 — Composant zone-picker terrain (sélection 11 zones)

**En tant que** gardien en train de taguer un tir,
**Je veux** taper directement sur le terrain SVG à l'endroit d'où le tir est parti,
**Afin de** saisir la zone de tir en un seul tap, sans liste déroulante.

## Contexte technique
- Zone concernée : nouveau fichier `js/zone-picker.js`.
- **Ce composant n'existe pas dans l'export** — `terrain-zones.js` ne fournit que la géométrie pure (`buildCourtZones`, `COURT_ZONE_ORDER`) et un rendu **heatmap** (`renderCourtZones`), pas de rendu "picker" cliquable. Voir `docs/architecture.md` §5 pour la fonction exacte à écrire (`renderCourtZonePicker`), qui réutilise `buildCourtZones()`/`COURT_ZONE_ORDER` sans les modifier.
- Point d'attention critique (cf. `docs/architecture.md` §5 et `docs/risks/book-impact-gardien.md` #zones concaves) : les zones `69MG`/`69MC`/`69MD` sont des anneaux concaves — le hit-testing doit fonctionner sur toute leur surface visible, pas seulement leur enveloppe convexe. Utiliser un `fill` plein (`var(--bg3)` au repos) plutôt que `fill="none"`.
- Un seul listener délégué sur le `<svg>` (`evt.target.closest('[data-zone]')`), pas un listener par polygone.
- État visuel : zone survolée/pressée/sélectionnée selon `docs/visual/book-impact-gardien.md` §4 (ligne "Polygone zone terrain").

## Critères d'acceptation
- [ ] `renderCourtZonePicker(selectedZone)` génère les 11 polygones cliquables avec `data-zone` correct, en réutilisant `buildCourtZones()` sans dupliquer sa logique géométrique.
- [ ] Un tap n'importe où dans la surface visible de `69MC`, `69MG`, `69MD` (y compris près du bord intérieur de l'anneau) sélectionne correctement la zone — testé manuellement à la souris et au doigt (émulateur tactile navigateur).
- [ ] Le tap sur `AILG`/`AILD` (triangles d'aile) fonctionne correctement même près du sommet pointu du triangle.
- [ ] La zone sélectionnée reçoit la classe `active` / le style de sélection défini par le Visual Crafter (contour `--accent` + glow).
- [ ] `terrain-zones.js` n'est pas modifié (diff vide avec l'export).
- [ ] Le composant expose une API simple réutilisable indépendamment de l'écran qui l'utilise (pas de dépendance à `state.js` à l'intérieur de `zone-picker.js` — il reçoit `selectedZone` en paramètre et retourne du HTML, le câblage du clic vers l'état applicatif se fait dans l'écran appelant).

## Hors scope
- Intégration dans l'écran de saisie (STORY-06a la consomme).
- Le rendu heatmap du terrain pour le Book (`renderCourtZones`, déjà existant, réutilisé tel quel en STORY-07b).

## Dépend de
STORY-01

## Taille
M
