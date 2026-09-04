# STORY-18a — Réordonnancement de l'écran de saisie match

**En tant que** gardien qui documente un match en direct,
**Je veux** que l'écran de saisie affiche Résultat, puis Zone de cage, puis Zone de tir, avec les rosters des deux équipes autour du bloc central sur les écrans assez larges,
**Afin de** lire l'écran dans l'ordre naturel (résultat, où dans la cage, d'où venait le tir) et disposer de plus de place quand l'écran le permet.

## Contexte technique
- Zone concernée : `js/screens/screen-saisie-match.js` (fonction `renderScreenSaisieMatch()` — restructuration du HTML uniquement, aucune logique de `bindScreenSaisieMatch()`/`saveMatchImpact()`/`tryAutoSaveMatch()`/`handleAnnulerDernierImpactMatch()` ne change), `css/app.css` (nouvelles règles de layout).
- Nouvelles structures : aucune donnée. Nouveau markup uniquement : un conteneur `.saisie-match-center` regroupant Résultat/Cage/Terrain, les deux `.team-roster` deviennent des enfants directs de `.screen-saisie-match` (sortent du wrapper `.team-rosters-row` existant, qui n'est plus utilisé par cet écran).
- Impact sur l'existant :
  - Ordre HTML : Résultat → Zone de cage → Zone de tir (au lieu de Résultat → Zone de tir → Zone de cage aujourd'hui).
  - `renderTeamRoster()` reste identique dans son contenu (liste de `.player-btn`) — seule sa position dans le DOM change.
  - Nouvelle règle CSS `body:has(.screen-saisie-match) #app{ max-width: 920px; }` dans `app.css` — élargit `#app` (plafonné à 480px partout ailleurs) uniquement quand cet écran est affiché. Aucune autre page n'est concernée.
  - Layout CSS Grid à 3 colonnes (`180px 1fr 180px`) actif à partir de 760px de large ; en dessous, disposition à 1 colonne.
  - **Point d'attention explicite (remonté par le Risk Analyst)** : le comportement actuel des rosters a en réalité **3 paliers**, pas 2 — à reproduire à l'identique pour les deux premiers :
    - **< 480px** (téléphone réel) : les deux rosters en pile verticale complète (comportement `.team-rosters-row` actuel sous `@media (max-width:480px)`).
    - **480–759px** : les deux rosters en rangée à 2 colonnes sous le bloc central (comportement `.team-rosters-row` actuel par défaut).
    - **≥ 760px** (nouveau) : les deux rosters en colonnes latérales de part et d'autre du bloc central.
  - Le bandeau de confirmation/erreur reste en pleine largeur de l'écran à tous les paliers (ne suit pas la colonne centrale seule en layout 3 colonnes).

## Critères d'acceptation
- [ ] L'ordre vertical du bloc central est Résultat → Zone de cage → Zone de tir.
- [ ] En dessous de 480px de largeur de viewport réel (téléphone), les deux rosters s'affichent en pile verticale complète, comme aujourd'hui.
- [ ] Entre 480 et 759px, les deux rosters s'affichent en rangée à 2 colonnes sous le bloc central, comme aujourd'hui.
- [ ] À partir de 760px, les deux rosters s'affichent en colonnes latérales de part et d'autre du bloc central, et `#app` s'élargit au-delà de 480px uniquement sur cet écran.
- [ ] Toutes les autres pages de l'app conservent leur largeur maximale de 480px (vérifié en naviguant vers un autre écran depuis la saisie match — pas de fuite du style).
- [ ] Le comportement fonctionnel (auto-enregistrement, verrouillage anti double-tap, bandeau d'erreur/confirmation, annulation du dernier impact) est strictement inchangé.
- [ ] Le tap sur les 11 zones du terrain (y compris les zones concaves `69MG`/`69MC`/`69MD`) et sur les 9 zones de la cage fonctionne exactement comme avant, testé aux 3 paliers de largeur.
- [ ] Le bandeau de confirmation/erreur reste en pleine largeur de l'écran, y compris en layout 3 colonnes.

## Hors scope
- Habillage visuel réaliste du but et du terrain (texture, poteaux, filet) — cf. STORY-18b.
- Toute modification de `screen-tireur.js`/`screen-book.js` (cf. STORY-17).
- Toute modification du schéma Supabase.

## Dépend de
Aucune.

## Taille
M
