# Code Review — STORY-19 : Navigation "Book par tireur" par équipe puis joueur

## Conformité architecture
Diff conforme à `docs/arch/book-par-equipe.md` :
- Deux nouveaux écrans (`book-equipes`, `book-joueurs`) réutilisant uniquement des fonctions `api.js` déjà existantes (`getEquipes`, `getJoueursByEquipe`, `getTireursRecents`) — aucune nouvelle requête, aucune modification de `screen-equipes.js`/`screen-joueurs.js` (confirmé, diff vide sur ces deux fichiers).
- Mécanisme `state.bookBackTarget` implémenté exactement comme spécifié : positionné aux 3 points d'entrée (`screen-tireur.js` ×2, `screen-book-equipes.js` recents, `screen-book-joueurs.js`), lu avec repli `|| "tireur"` aux 2 endroits de `screen-book.js` (header + bouton état vide).
- Les 4 fichiers existants modifiés (`screen-accueil.js`, `screen-tireur.js`, `screen-book.js`, `state.js`) correspondent exactement aux diffs prévus dans l'architecture — aucune ligne en trop, aucun effet de bord.
- `index.html` : 2 balises ajoutées au bon endroit (groupées avec `screen-equipes.js`/`screen-joueurs.js`, avant `screen-book.js`).

## Écart mineur avec l'architecture — Note (non bloquant)
`docs/arch/book-par-equipe.md` §3.1 précisait "pas de `Promise.all` nécessaire, volumes faibles" (deux appels séquentiels attendus) ; l'implémentation utilise `Promise.all([getEquipes(), getTireursRecents(...)])`. C'est strictement équivalent en comportement (même gestion d'erreur groupée via le seul `catch`), légèrement plus rapide (chargement concurrent), et un pattern JS standard sans risque. Déviation cosmétique de la documentation, pas du comportement — aucune action requise, à signaler pour que l'Architecte mette à jour sa note si souhaité.

## Scope
Diff strictement limité aux fichiers listés dans le "Contexte technique" de la story. Aucun fichier vendor touché, aucune modification de `screen-equipes.js`/`screen-joueurs.js` (Paramètres, CRUD) — confirmé par `git diff --stat`.

## Réutilisation vs duplication
- `renderBookRecentRow()`/`renderBookJoueurRow()` sont de nouvelles fonctions (pas de duplication de `renderTireurRow()`/`renderJoueurRow()` existantes) — justifié : ces nouvelles lignes n'ont **pas** de boutons ✏️/🗑 (lecture seule), une factorisation aurait demandé un paramètre conditionnel dans les fonctions existantes pour un gain de duplication minime (2 fonctions courtes, ~5 lignes chacune). Choix raisonnable, cohérent avec la décision d'architecture de ne pas complexifier les écrans CRUD existants.
- Classes CSS/HTML réutilisées à l'identique (`list-card`, `tireur-row`, `tireur-row-top`, `tireur-nom`, `tireur-lat`, `tireur-meta`, `empty-hint`, `section-label`, `skeleton-list`) — seules 2 nouvelles règles CSS ajoutées (`.book-recents`, `.list-card-nav`), conforme au document Visual.

## Convention de nommage/style
- `_bookEquipesScreen`/`_bookJoueursScreen` : état privé préfixé `_`, conforme.
- `data-action` + délégation partout, aucun `onclick` inline.
- `escapeHtml()` systématique sur toute donnée utilisateur (nom, id en attribut, poste/club via `posteLabel`).
- Nommage des fonctions de cycle de vie (`reRenderScreenX`/`loadScreenX`) aligné sur `screen-equipes.js`/`screen-joueurs.js` (écrans les plus proches en forme) plutôt que sur `refreshXScreen` (screen-tireur.js/screen-book.js) — les deux conventions coexistent déjà dans le projet, choix cohérent avec la famille d'écrans la plus proche.

## Gestion d'erreurs
`try/catch` systématique sur les deux nouveaux écrans, état `error` avec bouton "Réessayer" — cohérent avec tous les écrans existants du projet.

## Sécurité basique
Aucune surface nouvelle : 3 fonctions `select` déjà exercées en production sous les mêmes policies RLS. Pas de convocation du Security Auditor (critère du projet respecté).

## Vérification des critères d'acceptation (lecture statique + vérification live du Developer)
Tous les critères de la story ont été vérifiés en direct par le Developer (backend réel, 3 chemins de retour, état vide équipe, bouton retour de l'état vide du Book, non-régression `equipeCourante` en navigant Paramètres↔Book) — cf. son récapitulatif. Aucune divergence trouvée entre le comportement observé et les critères écrits.

## Verdict
**APPROUVÉ**
