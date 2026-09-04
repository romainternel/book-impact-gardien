# PRD — Recentrage Match (écran de saisie + simplification du flow Book)

## 1. Objectif
Faire de l'écran de saisie match l'écran de référence de l'app (le seul point de saisie), avec un ordre de lecture naturel et un habillage visuel réaliste (vrai but, vrai terrain), et supprimer le détour par l'ancien écran de saisie autonome depuis "Book par tireur".

## 2. Décisions produit (résolvent les ambiguïtés du brief)

### 2.1 Ordre des sections de l'écran de saisie match
Résultat (but/non-but) → Zone de cage → Zone de tir → Rosters (deux équipes, en colonnes latérales de part et d'autre du bloc central Résultat/Cage/Terrain). La cage est positionnée visuellement au-dessus du terrain (cohérent avec la réalité : le but est au fond du terrain, on "descend" vers la zone de tir en lisant l'écran de haut en bas).

### 2.2 Réalisme visuel sans toucher au vendor
Aucune modification de `js/vendor/terrain-zones.js`, `js/vendor/goal-cage-zones.js` ni `css/zones.css` (contrainte actée, cf. CLAUDE.md §8). Le réalisme (vrai but, vrai terrain) s'obtient par des couches visuelles additionnelles dans `app.css` et par un nouveau balisage de mise en page dans `screen-saisie-match.js` (wrappers autour des fonctions vendor existantes) — jamais par modification des fonctions de rendu elles-mêmes ou de leur géométrie.

### 2.3 Retrait de l'écran de saisie impact autonome du parcours
`screen-impact.js` (mode Book historique, saisie hors match) n'est plus atteignable depuis nulle part dans l'app. Sélectionner un tireur depuis "Book par tireur" (`screen-tireur.js`) mène directement à son Book (`screen-book.js`). Le fichier `screen-impact.js` est retiré de `index.html` et son code n'est plus utilisé — pas de mode dégradé, pas de flag pour le "garder au cas où" (cohérent avec la doctrine du projet : ne pas garder de code mort).

### 2.4 Aucune migration de données nécessaire
Le schéma `impacts` reste inchangé. Les colonnes `type_tir`, `main`, et les valeurs `arret`/`poteau`/`hors_cadre` de `resultat` restent en base pour les données déjà saisies via l'ancien flow — elles continuent de s'afficher normalement dans le Book (stats, historique, badges). Seule la capture de **nouvelles** données de ce type s'arrête, puisque le mode Match ne les demande pas (déjà le cas depuis STORY-14a).

## 3. Features

### F1 — Réordonnancement de l'écran de saisie match
Nouvel ordre vertical du bloc central : Résultat → Zone de cage → Zone de tir. Les rosters des deux équipes passent de "bloc empilé sous le terrain" à "colonnes latérales" de part et d'autre du bloc central, sur les largeurs d'écran qui le permettent.

### F2 — Cage réaliste
La grille de sélection à 9 zones (`renderGoalZoneGrid`, inchangée dans sa logique et son marquage `data-gz`) est encadrée visuellement pour évoquer un vrai but : poteaux, barre transversale, texture de filet en arrière-plan des cellules. Le comportement de sélection (tap sur une cellule) est strictement identique.

### F3 — Terrain moins "terne"
Le rendu SVG du terrain (`courtSvgMarkup()` + `renderCourtZonePicker()`, inchangés) est enrichi visuellement en arrière-plan/pourtour (texture, profondeur, meilleur contraste des lignes) via `app.css` et un conteneur additionnel, sans toucher à la géométrie des zones ni aux fonctions vendor.

### F4 — Rosters latéraux responsive
Sur les largeurs où l'écran le permet, les deux rosters encadrent le bloc central (gauche/droite). En dessous d'un certain seuil de largeur (mobile étroit, cohérent avec le comportement déjà existant à ~480px), repli en empilement vertical (équipe A puis équipe B), comme c'est déjà le cas aujourd'hui — pas de régression du comportement mobile qui est l'usage principal de l'app.

### F5 — Navigation directe "Book par tireur" → Book
`screen-tireur.js` : sélectionner un tireur existant, ou en créer un nouveau, navigue directement vers `renderScreen("book")` au lieu de `renderScreen("impact")`. Le bouton "retour" du Book (actuellement câblé sur `impact`) pointe désormais vers `tireur`.

### F6 — Retrait de l'écran de saisie impact autonome
Suppression de la balise `<script src="js/screens/screen-impact.js">` dans `index.html` et du fichier `js/screens/screen-impact.js` lui-même. Aucun autre écran ne référence plus `renderScreen("impact")`.

## 4. Priorités

| Feature | Priorité |
|---|---|
| F5 — Navigation directe Book par tireur → Book | Must Have |
| F6 — Retrait de screen-impact.js | Must Have |
| F1 — Réordonnancement de l'écran de saisie match | Must Have |
| F2 — Cage réaliste | Must Have |
| F3 — Terrain moins terne | Must Have |
| F4 — Rosters latéraux responsive | Must Have |

Toutes les features sont Must Have : c'est une demande produit directe et cadrée, pas un backlog à prioriser entre plusieurs options.

## 5. Critères d'acceptation
- Depuis "Book par tireur", sélectionner un tireur existant affiche directement son Book — plus jamais l'ancien écran de saisie impact.
- Créer un nouveau tireur depuis "Book par tireur" affiche directement son Book (vide, aucun tir).
- `js/screens/screen-impact.js` n'est plus chargé par `index.html` et n'est plus référencé par aucun `renderScreen(...)`.
- Sur l'écran de saisie match : l'ordre visuel de haut en bas est Résultat, puis Zone de cage, puis Zone de tir.
- La zone de cage est visuellement identifiable comme un but (poteaux/barre/filet), la sélection d'une des 9 zones fonctionne exactement comme avant.
- Le terrain conserve exactement les mêmes 11 zones cliquables au même endroit (aucune régression de hit-testing, y compris sur les zones concaves 69MG/69MC/69MD) avec un habillage visuel plus riche.
- Les rosters des deux équipes sont positionnés en colonnes latérales sur un affichage assez large, et repassent en empilement sur mobile étroit — cohérent avec le point de bascule déjà utilisé ailleurs dans l'app.
- Aucune régression sur l'auto-enregistrement, le verrouillage anti double-tap, le bandeau d'erreur/confirmation et l'annulation du dernier impact (mode Match, STORY-14b).
- Le Book d'un tireur ayant des impacts historiques avec `type_tir`/`main` renseignés (ancien flow) continue de les afficher correctement.

## 6. Hors scope
- Toute modification du schéma Supabase (aucune migration).
- Réintroduction d'un mode de saisie hors match sous quelque forme que ce soit.
- Modification du comportement fonctionnel de la saisie (logique d'auto-save, verrouillage, annulation) — seul l'habillage visuel et l'ordre d'affichage changent.
- Refonte des écrans Équipes/Joueurs/Matchs/Paramètres.
- Animation ou effet 3D avancé pour le terrain/la cage — réalisme visuel via CSS (texture, ombre, dégradés), pas de moteur de rendu.

## 7. Dépendances
Aucune dépendance bloquante — s'appuie sur le mode Match déjà livré et validé (STORY-13/14a/14b) et sur `zone-picker.js`/`tireur-form-shared.js` existants.

## 8. Risques identifiés à ce stade (détaillés par le Risk Analyst)
- Perte de capacité de saisie fine (`type_tir`, `main`, distinction arrêt/poteau/hors-cadre) pour les tirs futurs — tradeoff assumé explicitement par l'utilisateur, à documenter comme décision produit actée plutôt que comme un oubli.
- Densité visuelle : ajouter un habillage réaliste (texture filet, texture terrain) tout en gardant les rosters latéraux lisibles sur mobile étroit — risque de surcharge visuelle si mal dosé, à trancher par le Designer/Visual Crafter.
- Nettoyage incomplet : s'assurer qu'aucune référence résiduelle à `screen-impact.js`/`renderScreen("impact")` ne subsiste après suppression (le grep de l'Architect doit être exhaustif).
