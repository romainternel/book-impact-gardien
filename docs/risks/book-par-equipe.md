# Risques — Book par équipe (navigation Équipe → Joueur)

## Tableau des risques

| # | Risque | Probabilité | Impact | Recommandation |
|---|---|---|---|---|
| 1 | **Tireurs libres rendus difficiles à trouver** — un tireur sans équipe (`equipe_id = null`) n'apparaît plus que via "🔍 Rechercher un tireur" ou le bandeau "Récemment consultés". Si l'utilisateur ne pense pas à taper sur ce lien, il peut croire le tireur "disparu". | Moyenne (changement d'habitude — l'ancien flow affichait tout par défaut) | Moyen (donnée non perdue, juste moins découvrable) | Le lien "🔍 Rechercher un tireur" doit être visible **sans scroll** en haut de l'écran "Book — Équipes", au même niveau de proéminence qu'une carte d'équipe — déjà spécifié par le Designer, à vérifier explicitement par le QA (visible sans interaction sur un écran de taille standard). |
| 2 | **Retour cassé après consultation via une équipe** — sans mécanisme dédié, le bouton retour du Book ramènerait toujours vers la recherche (`tireur`), pas vers le roster de l'équipe consultée, cassant le parcours "consulter chaque joueur d'une équipe l'un après l'autre". | Élevée si le mécanisme `state.bookBackTarget` (cf. Architecture §2) est oublié sur un des trois points d'entrée | Moyen (navigation confuse, pas de perte de donnée, contournable en re-tapant l'équipe) | Critère d'acceptation bloquant explicite : les 3 points d'entrée vers `book` (recherche, récents, roster d'équipe) positionnent chacun `state.bookBackTarget` avant `renderScreen("book")` — vérifié par un parcours réel testant le retour depuis chacun des 3 chemins, pas seulement un seul. |
| 3 | **Confusion de nommage avec les écrans Paramètres** — "Book — Joueurs d'une équipe" (nouveau, lecture seule, mène au Book) et "Joueurs" (Paramètres, existant, CRUD, mène à un formulaire d'édition) partagent le même roster de données et un intitulé proche ; un utilisateur pourrait taper sur un joueur en pensant pouvoir l'éditer. | Faible-Moyenne | Faible (pas de perte de donnée — l'utilisateur atterrit juste sur le Book au lieu d'un formulaire, aucune action destructive possible par erreur) | Déjà mitigé par le Designer : le header du nouvel écran affiche le **nom de l'équipe** (ex. "BILLERE"), jamais le mot générique "Joueurs" — aucune action supplémentaire requise, à vérifier visuellement par le QA. |
| 4 | **Référence résiduelle à l'ancien point d'entrée direct** — un endroit du code pourrait encore supposer que "Book par tireur" mène directement à `screen-tireur.js` depuis l'Accueil. | Faible (3 points de code identifiés exhaustivement par l'Architect via recherche globale de `"tireur"`/`"accueil"`, cf. Architecture §4) | Moyen si un point est manqué (lien mort ou navigation incohérente) | Recherche exhaustive de `renderScreen("tireur")` et `{ back: "accueil" }` dans tout `js/` avant de clore la story, au-delà des 3 points déjà identifiés — même discipline que STORY-17. |
| 5 | **Collision sur `state.equipeCourante` partagé entre le flow Paramètres (CRUD) et le nouveau flow Book (lecture)** — les deux flows utilisent le même champ d'état pour porter l'équipe sélectionnée. | Faible (le champ est toujours réécrit explicitement juste avant chaque écran qui en dépend, cf. Architecture §8) | Faible si ça arrive (roster de la mauvaise équipe affiché brièvement, corrigé dès qu'une équipe est re-sélectionnée) | Test de non-régression explicite : naviguer Paramètres → Équipes → équipe A → Joueurs, revenir en arrière plusieurs fois, puis Book par tireur → équipe B → vérifier que le roster affiché est bien celui de B, pas un résidu de A. |
| 6 | **Équipe sans aucun joueur** — état déjà géré par construction (`screen-joueurs.js` a le même cas), mais le nouvel écran doit reproduire le même traitement plutôt que planter ou afficher une liste vide sans explication. | Faible | Faible | Déjà spécifié par le Designer (`empty-hint` identique) — critère d'acceptation à vérifier avec une équipe existante sans joueur (ou créée pour le test).

## Classement
- **P0** — aucun (rien de bloquant pour la production ni de perte de données possible)
- **P1** — #2 (retour cassé), #1 (tireurs libres moins découvrables)
- **P2** — #4 (référence résiduelle), #5 (collision d'état)
- **P3** — #3 (confusion de nommage), #6 (équipe vide)

## Mitigations P1 → critères d'acceptation pour le Scrum Master

**P1-#2 → critère d'acceptation bloquant sur la story des nouveaux écrans (ou une story dédiée à la cible de retour) :**
> Consulter un tireur via chacun des 3 chemins (recherche, récents, roster d'équipe) puis taper "retour" depuis le Book : dans les 3 cas, l'utilisateur revient exactement à l'écran d'où il vient (recherche → recherche, récents → Book — Équipes, roster d'équipe → Book — Joueurs de cette équipe), pas systématiquement vers la recherche.

**P1-#1 → critère d'acceptation sur la story de l'écran "Book — Équipes" :**
> Le lien "🔍 Rechercher un tireur" est visible immédiatement à l'ouverture de l'écran, sans nécessiter de scroll sur un écran de taille standard (test réalisé sur un viewport mobile réel, ~375px de large), y compris quand il n'y a aucun tireur récent (pas de bandeau au-dessus qui le pousserait hors champ).
