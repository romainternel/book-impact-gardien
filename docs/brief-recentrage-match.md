# Brief — Recentrage Match (écran de saisie + simplification du flow Book)

## 1. Contexte
Le mode Match (STORY-08 à 16) est désormais le point d'entrée réel de toute la saisie de tirs — l'utilisateur confirme que "la saisie est faite sur les matchs directement". L'ancien écran de saisie autonome (`screen-impact.js`, mode Book historique — sélection tireur → tag hors match) n'a plus lieu d'exister comme point d'entrée : depuis "Book par tireur", l'utilisateur veut atterrir directement sur le Book (stats/historique/heatmaps) d'un tireur, pas sur un écran de saisie qu'il n'utilise plus.

En parallèle, l'écran de saisie match (`screen-saisie-match.js`), qui devient donc le seul écran de saisie de l'app, est jugé visuellement pauvre : le terrain est "terne", la zone de cage est une grille abstraite de 9 cases sans rapport visuel avec un vrai but de handball, et l'ordre des sections (Résultat → Terrain → Cage → Rosters) ne reflète pas la façon dont l'utilisateur veut lire l'écran (résultat, puis où dans la cage, puis d'où vient le tir).

## 2. Problème
- Un gardien qui va dans "Book par tireur" pour consulter un book doit aujourd'hui passer par un écran de saisie qu'il n'utilise plus (la saisie réelle se fait via le mode Match) — un détour inutile, une confusion sur "à quoi sert cet écran".
- L'écran de saisie match, utilisé à chaque tir de chaque match documenté, ne donne pas une sensation de vrai terrain/vrai but — alors que c'est l'écran le plus regardé de toute l'app pendant un visionnage.

## 3. Besoin réel vs solution proposée
- **Solution proposée** : réordonner les sections, dessiner un vrai but et un vrai terrain, mettre les rosters sur les côtés, sauter l'écran de saisie impact depuis "Book par tireur".
- **Besoin réel sous-jacent** : que l'écran le plus utilisé de l'app (la saisie match) soit agréable à regarder pendant un visionnage prolongé et lisible dans le bon ordre de lecture (résultat → où dans la cage → d'où venait le tir), et que la navigation de l'app reflète l'usage réel (plus de saisie hors match, donc plus de détour par cet écran).

## 4. Utilisateurs
Même utilisateur principal que le reste de l'app (le gardien/observateur qui documente pendant un visionnage vidéo, sur téléphone). Usage quotidien/hebdomadaire pendant la saison. Aucune formation requise — l'app doit rester utilisable au coup d'œil.

## 5. Clarification importante (déjà actée, à ne pas re-questionner)
Le "gardien" de l'app (ex. "Gabin") est l'observateur/analyste qui utilise l'app pendant le visionnage — **jamais** le gardien de but réellement sur le terrain pendant le match documenté (celui-ci est un `tireur`/joueur d'équipe avec `poste = 'gardien_but'` s'il est concerné). Cette distinction, déjà actée dans `docs/brief-mode-match.md` §5, doit continuer à être respectée dans toute maquette ou visuel : aucun élément visuel ne doit suggérer que le "gardien" observateur est un joueur du match en cours.

## 6. Vision
Faire de l'écran de saisie match un véritable "poste d'observation" — lisible dans l'ordre naturel (résultat, cage, terrain), visuellement proche d'un vrai but et d'un vrai terrain de handball — et simplifier la navigation de l'app pour qu'elle reflète l'usage réel : toute saisie passe par un match, "Book par tireur" ne sert plus qu'à consulter.

## 7. Scope
### Dedans
- Réordonnancement de l'écran de saisie match : Résultat → Zone de cage → Zone de tir → Rosters (équipe A à gauche, équipe B à droite de l'ensemble résultat/cage/terrain).
- Refonte visuelle de la zone de cage pour évoquer un vrai but de handball (poteaux, barre transversale, texture de filet) — sans modifier `js/vendor/goal-cage-zones.js` (grille de sélection à 9 zones inchangée dans sa logique).
- Refonte visuelle du terrain pour être moins "terne" (texture, profondeur, meilleure hiérarchie visuelle) — sans modifier `js/vendor/terrain-zones.js` ni `css/zones.css`.
- Suppression du point d'entrée "tireur sélectionné → écran de saisie impact" (`screen-impact.js`) : sélectionner un tireur depuis "Book par tireur" mène directement à son Book.
- Retrait de `screen-impact.js` du parcours utilisateur (écran devenu inaccessible autrement) et nettoyage de son inclusion dans `index.html`.

### Dehors
- Toute évolution du schéma de données (aucune migration nécessaire — le schéma `impacts` reste inchangé, les données historiques saisies via l'ancien flow restent valides et s'affichent normalement dans le Book).
- Réintroduction d'un flow de saisie hors match sous une autre forme (l'utilisateur est explicite : "la saisie est faite sur les matchs directement").
- Modification du comportement de saisie du mode Match lui-même (auto-enregistrement, verrouillage anti double-tap, bandeau d'erreur/confirmation) — ce comportement, déjà robuste (STORY-14b), n'est pas remis en cause, seulement son habillage visuel et l'ordre d'affichage.
- Modification des écrans Équipes/Joueurs/Matchs/Paramètres — hors périmètre de cette feature.

## 8. Critères de succès
- L'écran de saisie match affiche Résultat, puis Zone de cage, puis Zone de tir, dans cet ordre, avec les deux rosters en colonnes latérales.
- La zone de cage et le terrain sont visuellement reconnaissables comme "un but" et "un terrain" par quelqu'un qui découvre l'écran, pas juste comme des grilles/formes abstraites.
- Depuis "Book par tireur", sélectionner un tireur (existant ou nouvellement créé) affiche directement son Book — plus aucun écran intermédiaire de saisie.
- Aucune régression sur le mode Match existant (auto-save, verrouillage, annulation) ni sur les stats du Book (les impacts historiques avec `type_tir`/`main`/4 valeurs de résultat continuent de s'afficher correctement).

## 9. Questions en suspens
Aucune — le scope est cadré directement par l'utilisateur, sans zone d'ambiguïté bloquante. Le PM tranchera le détail de mise en page (répartition exacte des largeurs entre rosters et centre) et le Designer produira la maquette précise.
