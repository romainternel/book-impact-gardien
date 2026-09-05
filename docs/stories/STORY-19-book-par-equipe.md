# STORY-19 — Navigation "Book par tireur" par équipe puis joueur

**En tant que** gardien qui prépare un match à venir,
**Je veux** parcourir "Book par tireur" par équipe puis par joueur de cette équipe,
**Afin de** consulter facilement le book de chaque joueur d'une équipe adverse l'un après l'autre, sans avoir à retaper son nom dans une recherche.

## Contexte technique
- Zone concernée : `js/screens/screen-accueil.js` (1 ligne), `js/screens/screen-tireur.js` (back target + 2 points d'entrée vers `book`), `js/screens/screen-book.js` (cible de retour dynamique), `js/state.js` (nouveau champ), `index.html` (2 nouvelles balises `<script>`). Deux nouveaux fichiers : `js/screens/screen-book-equipes.js`, `js/screens/screen-book-joueurs.js`.
- Nouvelles structures : aucune donnée. `state.bookBackTarget` (string|null, en mémoire) — nom de l'écran vers lequel le bouton retour du Book doit pointer, positionné explicitement par l'écran appelant juste avant chaque `renderScreen("book")`.
- Impact sur l'existant :
  - `screen-accueil.js` : la carte "📖 Book par tireur" pointe vers `book-equipes` au lieu de `tireur`.
  - `screen-tireur.js` : `{ back: "accueil" }` → `{ back: "book-equipes" }` ; les deux appels existants à `renderScreen("book")` (sélection tireur existant, création) sont précédés de `state.bookBackTarget = "tireur";`. Aucun autre changement (recherche, création, édition, suppression identiques).
  - `screen-book.js` : `{ back: "tireur" }` → `{ back: state.bookBackTarget || "tireur" }` ; le handler du bouton "Retour" de l'état vide appelle `renderScreen(state.bookBackTarget || "tireur")` au lieu de `renderScreen("tireur")` codé en dur.
  - `screen-book-equipes.js` (nouveau, écran `book-equipes`) : header (`back: "accueil"`, titre = `state.gardienNom`) ; bandeau "Récemment consultés" (`getTireursRecents()`, absent si vide, tap → `state.tireurCourant = t; state.bookBackTarget = "book-equipes"; renderScreen("book");`) ; ligne "🔍 Rechercher un tireur" (tap → `renderScreen("tireur")`) ; liste des équipes (`getEquipes()`, tap → `state.equipeCourante = e; renderScreen("book-joueurs");`), état vide si aucune équipe.
  - `screen-book-joueurs.js` (nouveau, écran `book-joueurs`) : header (`back: "book-equipes"`, titre = `state.equipeCourante.nom`) ; liste des joueurs de l'équipe (`getJoueursByEquipe(state.equipeCourante.id)`), **lignes entièrement cliquables** (tap → `state.tireurCourant = j; state.bookBackTarget = "book-joueurs"; renderScreen("book");`), pas de boutons ✏️/🗑 (lecture seule, l'édition reste dans Paramètres) ; état vide "Aucun joueur dans cette équipe" si roster vide ; retour anticipé si `!state.equipeCourante`.
  - `state.js` : ajout de `bookBackTarget: null` à l'objet `state` initial.
  - `index.html` : ajout de `<script src="js/screens/screen-book-equipes.js"></script>` et `<script src="js/screens/screen-book-joueurs.js"></script>`, positionnées à côté de `screen-equipes.js`/`screen-joueurs.js`.

## Critères d'acceptation
- [ ] Depuis Accueil → "📖 Book par tireur" : l'écran affiché est la liste des équipes (pas la recherche).
- [ ] Le lien "🔍 Rechercher un tireur" est visible immédiatement à l'ouverture de l'écran "Book — Équipes", sans scroll, sur un viewport mobile réel (~375px) — y compris quand il n'y a aucun tireur récemment consulté.
- [ ] Tap sur une équipe → affiche son roster (mêmes joueurs que Paramètres → Équipes → cette équipe → Joueurs).
- [ ] Tap sur un joueur du roster → affiche directement son Book (sans écran intermédiaire), le header du Book affiche bien son nom.
- [ ] Une équipe sans aucun joueur affiche l'état vide "Aucun joueur dans cette équipe" (pas d'erreur, pas de liste vide silencieuse).
- [ ] **Retour dynamique testé sur les 3 chemins distincts** : (a) recherche → sélection tireur → Book → retour → revient sur la recherche ; (b) Book — Équipes → bandeau récents → Book → retour → revient sur Book — Équipes ; (c) Book — Équipes → équipe → joueur → Book → retour → revient sur le roster de cette équipe (pas sur la recherche).
- [ ] Le bouton "Retour" de l'état vide du Book (aucun tir enregistré) suit la même cible dynamique que le bouton retour du header, testé sur au moins un chemin autre que la recherche.
- [ ] Un tireur libre (sans équipe) reste consultable via "🔍 Rechercher un tireur" et s'affiche correctement.
- [ ] Créer un nouveau tireur reste possible depuis la recherche, sans régression (comportement strictement inchangé).
- [ ] Aucune régression sur `screen-equipes.js`/`screen-joueurs.js` (Paramètres) : CRUD équipe/joueur, ✏️/🗑, inchangés.
- [ ] Test de non-régression `state.equipeCourante` : naviguer Paramètres → Équipes → équipe A → Joueurs, revenir en arrière, puis Book par tireur → équipe B → vérifier que le roster affiché est bien celui de B.
- [ ] Recherche exhaustive de `renderScreen("tireur")` et de `{ back: "accueil" }` dans tout `js/` après implémentation — aucune occurrence résiduelle au-delà des points listés dans le Contexte technique.

## Hors scope
- Toute modification du schéma Supabase (aucune migration).
- Toute modification des écrans Paramètres → Équipes/Joueurs (CRUD, non touchés).
- Toute modification du Book lui-même (stats/heatmaps/historique) ou du mode Match.
- UI de rattachement a posteriori d'un tireur libre à une équipe (dette déjà actée, CLAUDE.md §10).

## Dépend de
Aucune.

## Taille
M
