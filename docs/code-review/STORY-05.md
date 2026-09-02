# Code Review — STORY-05 : Composant zone-picker terrain

## Conformité Architecture
- `renderCourtZonePicker()` implémentée exactement comme spécifiée en `docs/architecture.md` §5, réutilise `buildCourtZones()`/`COURT_ZONE_ORDER` sans les modifier. ✅
- Ordre de rendu des polygones identique à `COURT_ZONE_ORDER` (donc 6MG/6MC/6MD toujours dessinées après 69MG/69MC/69MD, préservant le masquage visuel documenté dans le vendor). ✅
- `js/vendor/terrain-zones.js` : diff toujours vide avec l'export, re-vérifié après cette story. ✅

## Réutilisation vs duplication
- Aucune réimplémentation de géométrie : `zone-picker.js` ne fait que transformer la sortie de `buildCourtZones()` en polygones cliquables. Le conteneur `.court-pick`/`.court-svg-bg` de `zones.css` est réutilisé tel quel plutôt que d'inventer un nouveau wrapper CSS.

## Scope
- Fichiers touchés : `js/zone-picker.js` (nouveau), `css/app.css` (ajout `.zone-pick` et états), `index.html` (une ligne d'ajout du script). Rien hors de ce périmètre.

## Lisibilité et maintenabilité
- `bindCourtZonePicker()` isole le câblage d'événement (délégation unique, `closest('[data-zone]')`) — un futur écran (STORY-06a) n'a qu'à appeler cette fonction avec un callback, sans connaître les détails SVG internes.
- Commentaire d'en-tête renvoie explicitement à `docs/architecture.md` §5 pour le contexte du point de vigilance concave.

## Gestion d'erreurs
- Pas d'appel externe dans ce module — rien à couvrir de plus. `bindCourtZonePicker` ne valide pas que `svgEl` existe, mais c'est un contrat d'API interne (appelant responsable), cohérent avec le reste du style du projet (pas de garde-fou pour des cas impossibles en usage interne).

## Sécurité basique
Sans objet — composant purement front-end, aucune donnée sensible, aucun appel réseau.

## Point spécifique vérifié : hit-testing sur zones concaves
Le point d'attention critique de `docs/architecture.md` §5 (zones `69MG`/`69MC`/`69MD` concaves) a été testé en conditions réelles de navigateur (via `document.elementFromPoint` + `getScreenCTM`, pas une approximation) : le clic est correctement résolu au vrai centre géométrique de `69MC` (recalculé indépendamment de `COURT_ZONE_LABEL_POS`, cf. note ci-dessous), ainsi que sur `6MC`, `9MC` et `69MG` (branche hors-axe). `fill: var(--bg3)` (pas `fill:none`) confirmé comme le bon choix — sans ça, ces zones auraient un trou de hit-testing en leur centre.

## Note (non bloquant, hors scope de cette story)
En construisant les points de test, `COURT_ZONE_LABEL_POS["69MC"]` (position du label texte, définie dans le vendor `terrain-zones.js` non modifiable) s'est révélé ne **pas** tomber dans la propre bande géométrique de `69MC` à x=175 (centre du but) — il tombe en fait dans `6MC`. Ce n'est pas un défaut du picker (qui n'utilise pas cette constante), ni quelque chose à corriger ici (fichier vendor, non modifiable). Mais ça veut dire que dans le rendu **heatmap** (`renderCourtZones`, réutilisé tel quel en STORY-07b), le label texte "buts/tirs" de la zone `69MC` peut visuellement apparaître légèrement empiété sur la zone `6MC` voisine. À garder en tête pour la QA visuelle de STORY-07b — ce n'est pas un bug fonctionnel (l'agrégation des données reste correcte, c'est purement l'emplacement du texte).

## Verdict
**APPROUVÉ**
