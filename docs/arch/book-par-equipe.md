# Architecture — Book par équipe (navigation Équipe → Joueur)

## 1. Décision technique
Feature purement front-end, zéro migration de données, zéro nouvelle fonction Supabase. Deux nouveaux écrans légers (`js/screens/screen-book-equipes.js`, `js/screens/screen-book-joueurs.js`) qui réutilisent des fonctions `api.js` déjà existantes (`getEquipes()`, `getJoueursByEquipe()`, `getTireursRecents()`) ; `screen-tireur.js` (recherche) est conservé tel quel, seuls son point d'entrée et sa cible de retour changent.

### Pourquoi deux nouveaux écrans plutôt que réutiliser `screen-equipes.js`/`screen-joueurs.js`
Ces écrans Paramètres sont des écrans CRUD : lignes non cliquables (seuls ✏️/🗑 agissent), retour vers `parametres`. Les rendre conditionnels (comportement différent selon le point d'entrée) introduirait une branche `if (venant de Paramètres) {...} else {...}` dans deux écrans déjà en production — risque de régression sur du code qui fonctionne. Deux écrans dédiés et minces, qui n'appellent que les fonctions `api.js` (jamais les fichiers écrans Paramètres eux-mêmes), coûtent peu et gardent chaque écran simple à raisonner (cf. doctrine CLAUDE.md §4 : un écran = un fichier, état privé préfixé `_`).

## 2. Problème de navigation résolu : cible de retour dynamique du Book
`screen-book.js` a aujourd'hui une cible de retour **statique** (`back: "tireur"`, posée en STORY-17) — correcte tant qu'il n'existait qu'un seul chemin vers le Book. Avec trois chemins désormais possibles (recherche, bandeau récents, roster d'équipe), un retour statique casserait le parcours "je consulte le book de chaque joueur d'une équipe l'un après l'autre" : après le premier joueur, "retour" ramènerait à la recherche au lieu du roster de l'équipe.

**Solution** : un nouveau champ d'état `state.bookBackTarget` (string, nom d'écran), positionné explicitement juste avant chaque `renderScreen("book")` par l'écran appelant :
- Depuis `screen-tireur.js` (recherche, sélection ou création) : `state.bookBackTarget = "tireur"`.
- Depuis `screen-book-equipes.js` (bandeau récents) : `state.bookBackTarget = "book-equipes"`.
- Depuis `screen-book-joueurs.js` (roster d'équipe) : `state.bookBackTarget = "book-joueurs"`.

`screen-book.js` lit `state.bookBackTarget || "tireur"` (repli par défaut, sécurité si un futur appelant oublie de le positionner) au lieu du littéral `"tireur"`, à deux endroits : l'option `back` du header, et le handler du bouton "Retour" de l'état vide (qui appelle directement `renderScreen(state.bookBackTarget || "tireur")` plutôt que de coder en dur `renderScreen("tireur")`).

`state.equipeCourante` (déjà existant) reste intact et rechargeable : quand on revient sur `book-joueurs`, son `onMount` recharge le roster via `state.equipeCourante.id`, qui n'a pas été modifié entre-temps — pas de perte de contexte.

## 3. Nouveaux écrans

### 3.1 `screen-book-equipes.js` (nom d'écran : `book-equipes`)
- État : `_bookEquipesScreen = { status: "loading"|"ready"|"error", equipes: [], recents: [] }`.
- `onMount` : charge `getEquipes()` et `getTireursRecents(state.gardienId, 5)` (deux appels indépendants, même pattern try/catch que les écrans existants — pas de `Promise.all` nécessaire, volumes faibles).
- Rendu : header (`back: "accueil"`, titre = `state.gardienNom`) ; bandeau "RÉCEMMENT CONSULTÉS" (absent si `recents.length === 0`, pas d'état vide dédié) ; ligne "🔍 Rechercher un tireur" (`data-action="go-search"`) ; section "ÉQUIPES" + liste (`data-action="select-book-equipe"`, `data-id`) ou état vide si `equipes.length === 0`.
- Bind :
  - clic sur une ligne "récents" → `state.tireurCourant = t; state.bookBackTarget = "book-equipes"; renderScreen("book");`
  - clic sur "🔍 Rechercher un tireur" → `renderScreen("tireur")` (pas besoin de positionner `bookBackTarget` ici, ce n'est pas une navigation vers `book`)
  - clic sur une équipe → `state.equipeCourante = e; renderScreen("book-joueurs");`

### 3.2 `screen-book-joueurs.js` (nom d'écran : `book-joueurs`)
- État : `_bookJoueursScreen = { status: "loading"|"ready"|"error", joueurs: [] }`.
- `onMount` : si `!state.equipeCourante`, retour anticipé (cohérent avec le pattern déjà utilisé par `screen-joueurs.js`/`screen-book.js` pour un état requis manquant) ; sinon charge `getJoueursByEquipe(state.equipeCourante.id)`.
- Rendu : header (`back: "book-equipes"`, titre = `state.equipeCourante.nom`) ; liste de joueurs, **lignes entièrement cliquables** (`<button class="list-card ...">`, pas de `<div>` + boutons séparés comme `screen-joueurs.js`) ; état vide "Aucun joueur dans cette équipe" si liste vide.
- Bind : clic sur un joueur → `state.tireurCourant = j; state.bookBackTarget = "book-joueurs"; renderScreen("book");`

## 4. Écrans existants modifiés

### 4.1 `screen-accueil.js`
Ligne `{ icon: "📖", title: "Book par tireur", subtitle: "Scouter un tireur adverse", screen: "tireur" }` → `screen: "book-equipes"`. Une seule ligne, tableau de données déjà data-driven.

### 4.2 `screen-tireur.js`
- `renderScreenTireur()` : `renderAppHeader(..., { back: "accueil" })` → `{ back: "book-equipes" }`.
- Les deux points d'entrée vers `book` (sélection d'un tireur existant, création d'un nouveau) : ajouter `state.bookBackTarget = "tireur";` juste avant chaque `renderScreen("book")` existant (2 lignes ajoutées, aucune logique retirée).
- Aucun autre changement : recherche, création, édition, suppression restent identiques.

### 4.3 `screen-book.js`
- `renderScreenBook()` : `renderAppHeader(..., { back: "tireur" })` → `{ back: state.bookBackTarget || "tireur" }`.
- Bouton "Retour" de l'état vide : le handler `renderScreen("tireur")` devient `renderScreen(state.bookBackTarget || "tireur")`. Le `data-action="back-to-tireur"` reste inchangé (son nom ne reflète plus exactement sa cible, mais le renommer toucherait un attribut déjà testé/documenté pour un gain cosmétique nul — non fait).

### 4.4 `state.js`
Ajout d'un champ `bookBackTarget: null` à l'objet `state` initial (même famille que `tireurCourant`/`equipeCourante`, en mémoire, ne survit pas à un rechargement — cohérent avec le reste de l'état applicatif).

## 5. `index.html`
Ajout de deux balises `<script>` pour les nouveaux fichiers, positionnées **avant** `screen-tireur.js` (qui référence encore `renderScreen("book-equipes")` en cible de retour — sans contrainte d'ordre stricte ici puisque `renderScreen()` résout les noms d'écran à l'exécution, pas au chargement, mais positionnées à côté de `screen-equipes.js`/`screen-joueurs.js` pour la lisibilité du fichier, cohérent avec le tri par proximité fonctionnelle déjà en place) :
```html
<script src="js/screens/screen-book-equipes.js"></script>
<script src="js/screens/screen-book-joueurs.js"></script>
```

## 6. Nouvelles structures de données
Aucune. `equipes`, `tireurs.equipe_id`, RLS : tout existe déjà et est déjà exercé par les écrans Paramètres.

## 7. Sécurité
Aucune surface nouvelle : les trois fonctions `api.js` réutilisées (`getEquipes`, `getJoueursByEquipe`, `getTireursRecents`) sont des `select` déjà exercés par des écrans en production, sous les mêmes policies RLS déjà auditées (STORY-02/08). Pas de convocation du Security Auditor nécessaire (critère déjà établi dans ce projet : uniquement si une story touche rôles/auth/nouvelle ressource backend).

## 8. Risques (niveau architecture — détail complet par le Risk Analyst)
- Oubli de positionner `state.bookBackTarget` sur un futur nouveau point d'entrée vers `book` → repli par défaut sur `"tireur"` (comportement actuel), dégradation silencieuse mais jamais un écran cassé.
- `screen-book-joueurs.js` appelé avec `state.equipeCourante` déjà utilisé par le flow Paramètres (même champ d'état partagé) : si l'utilisateur navigue Paramètres → Équipes → (sélection) → puis change de contexte sans passer par un écran qui réinitialise `equipeCourante`, un état incohérent est théoriquement possible — à vérifier explicitement par le QA (naviguer entre les deux flows dans le désordre).
