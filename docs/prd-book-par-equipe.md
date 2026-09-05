# PRD — Book par équipe (navigation Équipe → Joueur)

## 1. Objectif
Faire de la structure équipe → joueur (déjà en place pour le mode Match) le chemin principal pour consulter un Book, sans rendre injoignable aucun tireur existant (libre ou d'équipe).

## 2. Décisions produit (résolvent les ambiguïtés du brief)

### 2.1 Remplacement du point d'entrée par défaut, recherche conservée en accès secondaire
"Book par tireur" (depuis Accueil) mène désormais par défaut à une liste d'équipes, puis au roster de l'équipe choisie, puis au Book. La recherche texte actuelle (`searchTireurs()`) n'est pas supprimée : elle reste accessible en un tap depuis l'écran Équipes ("🔍 Rechercher un tireur"), et devient le seul chemin pour les **tireurs libres** (`equipe_id = null`, non rattachés à une équipe) ainsi que pour la création d'un tireur libre. Décision tranchée ainsi plutôt qu'un remplacement pur : l'utilisateur a demandé "équipe plutôt que joueur" pour l'usage principal, mais aucun tireur existant ne doit devenir injoignable (cf. brief §4).

### 2.2 Tireurs récemment consultés : conservés, déplacés
`getTireursRecents()` (déjà existant) n'est plus affiché comme liste de démarrage mais comme un bandeau court en tête de la nouvelle liste d'équipes — accès rapide préservé aux tireurs consultés récemment (libres ou d'équipe), sans revenir à une simple liste plate par défaut.

### 2.3 Deux nouveaux écrans dédiés, pas de réutilisation conditionnelle des écrans Paramètres existants
`screen-equipes.js`/`screen-joueurs.js` (Paramètres) sont des écrans CRUD : les lignes ne sont pas cliquables pour naviguer (seuls "modifier"/"supprimer" agissent), et leur "retour" pointe vers Paramètres. Les réutiliser ici demanderait de la logique conditionnelle (comportement de clic différent selon le point d'entrée, cible de retour différente) — source de bugs pour un gain minime. Deux écrans distincts et légers sont créés à la place : ils réutilisent les **fonctions API** déjà existantes (`getEquipes()`, `getJoueursByEquipe()`) et le même langage visuel (`list-card-row`), mais avec leur propre navigation (ligne cliquable → suite du parcours, retour vers l'écran précédent du parcours Book). Zéro duplication de logique métier, zéro duplication de requête.

### 2.4 Équipes vides
Une équipe sans aucun joueur reste sélectionnable (cohérent avec `screen-joueurs.js` qui affiche déjà "Aucun joueur dans cette équipe") — état vide avec message, pas une équipe masquée de la liste.

## 3. Features

### F1 — Écran "Book — Équipes"
Nouveau point d'entrée de "Book par tireur" (Accueil). Liste des équipes (`getEquipes()`, même présentation que Paramètres → Équipes), tap → écran F2. Bandeau "Récemment consultés" en tête (jusqu'à 5 tireurs, `getTireursRecents()`, tap → Book direct). Lien secondaire "🔍 Rechercher un tireur" → écran F3.

### F2 — Écran "Book — Joueurs d'une équipe"
Roster de l'équipe sélectionnée (`getJoueursByEquipe()`, même présentation que Paramètres → Joueurs mais lignes cliquables). Tap sur un joueur → Book direct (comme le comportement déjà existant en F5 de STORY-17). État vide si l'équipe n'a aucun joueur. Retour → F1.

### F3 — Recherche (comportement actuel de `screen-tireur.js`, déplacé)
Recherche texte + création de tireur (avec ou sans équipe si le formulaire le permet déjà) — reprend à l'identique le comportement actuel de `screen-tireur.js` (recherche debouncée, édition, suppression). Seul son point d'entrée change (accessible depuis F1, plus depuis Accueil directement). Retour → F1.

### F4 — Navigation Accueil
Le bouton "📖 Book par tireur" de l'écran Accueil pointe désormais vers F1 au lieu de l'écran de recherche actuel.

## 4. Priorités

| Feature | Priorité |
|---|---|
| F1 — Écran Book — Équipes | Must Have |
| F2 — Écran Book — Joueurs d'une équipe | Must Have |
| F3 — Recherche (déplacée, comportement inchangé) | Must Have |
| F4 — Navigation Accueil mise à jour | Must Have |
| Bandeau "Récemment consultés" sur F1 | Should Have (valeur déjà existante à préserver, mais pas bloquant si repoussé) |

## 5. Critères d'acceptation
- Depuis Accueil → "Book par tireur" : une liste d'équipes s'affiche (pas une recherche).
- Sélectionner une équipe affiche son roster (mêmes joueurs que Paramètres → Équipes → cette équipe → Joueurs).
- Sélectionner un joueur du roster affiche directement son Book (sans écran intermédiaire, cohérent avec STORY-17).
- Un tireur libre (sans équipe) reste consultable via "🔍 Rechercher un tireur" depuis l'écran Équipes.
- Créer un nouveau tireur reste possible (au minimum depuis la recherche), sans régression sur cette capacité.
- Une équipe sans joueur affiche un état vide clair, pas une erreur.
- Aucune régression sur `screen-equipes.js`/`screen-joueurs.js` (Paramètres) — écrans non modifiés.

## 6. Hors scope
- Toute modification du schéma Supabase (`equipe_id` existe déjà, aucune migration).
- Toute modification des écrans Paramètres → Équipes/Joueurs (CRUD).
- Toute modification du Book lui-même (stats/heatmaps/historique) ou du mode Match.
- Fusion ou migration des tireurs libres vers une équipe (aucune UI de rattachement a posteriori — hors scope, cohérent avec la dette déjà actée en CLAUDE.md §10 sur l'absence d'UI de transfert `equipe_id`).

## 7. Dépendances
Aucune dépendance bloquante — s'appuie entièrement sur des fonctions API et un schéma déjà en place (`getEquipes()`, `getJoueursByEquipe()`, `getTireursRecents()`, `searchTireurs()`).

## 8. Risques identifiés à ce stade (détaillés par le Risk Analyst)
- Un tireur libre existant pourrait sembler "perdu" si l'utilisateur ne pense pas à taper sur "🔍 Rechercher" — visibilité de ce lien à soigner par le Designer.
- Trois écrans de clic (Équipes → Joueurs → Book) au lieu d'un seul aujourd'hui pour un joueur déjà connu par son nom — compensé par le bandeau "Récemment consultés" et la recherche toujours disponible en un tap.
- Risque de confusion entre les nouveaux écrans "Book — Équipes/Joueurs" et les écrans Paramètres du même nom — le Designer doit différencier clairement les intitulés/headers.
