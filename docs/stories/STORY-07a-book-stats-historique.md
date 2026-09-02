# STORY-07a — Écran Book tireur : stats et historique

**En tant que** gardien qui prépare un match,
**Je veux** consulter les stats clés d'un tireur adverse et l'historique de tous les tirs enregistrés sur lui,
**Afin de** me faire une idée rapide de ses habitudes avant de revoir le détail visuel des zones.

## Contexte technique
- Zone concernée : `js/screens/screen-book.js` (première moitié — stats + historique ; les heatmaps arrivent en STORY-07b sur le même écran).
- Maquette : `docs/design/book-impact-gardien.md` — Écran 4, cartes stats + section Historique.
- Utilise `getImpactsForTireur(tireurId)` de `api.js` — **tous gardiens confondus** pour les stats descriptives du tireur (main dominante, poste favori, nb tirs, historique), décision PM `docs/prd.md` §2.2. Le taux d'arrêt, lui, est filtré sur `gardien_id = gardien actif` uniquement (même source de données, filtrée côté client après récupération).
- Calcul du taux d'arrêt : `arrets / (buts + arrets)` sur les impacts du gardien actif pour ce tireur — `poteau` et `hors_cadre` exclus de ce ratio (définition standard d'un taux d'arrêt handball).
- Stat "main dominante" : calculée uniquement sur les impacts où `main` n'est pas null, et affichée avec le dénominateur réel ("sur X/N tirs avec main connue") — cf. `docs/risks/book-impact-gardien.md` risque #5.

## Critères d'acceptation
- [ ] Les 4 cartes stats affichent : nombre total de tirs, % main dominante (avec dénominateur explicite si < 100% de couverture), poste favori (le plus fréquent parmi les impacts renseignant un poste sur le tireur), taux d'arrêt du gardien actif face à ce tireur (annoté "face à {nom du gardien actif}").
- [ ] Avec moins de 3 tirs enregistrés au total, les stats main dominante/poste favori affichent "Pas encore assez de données" plutôt qu'un pourcentage sur échantillon minuscule.
- [ ] Avec zéro tir enregistré, l'écran affiche un état vide invitant à retourner en saisie, sans essayer de calculer de stats.
- [ ] L'historique liste chaque impact (date, contexte match, code zone de tir, code zone de cage ou "—" si hors cadre, badge résultat coloré selon `docs/visual/book-impact-gardien.md`), trié du plus récent au plus ancien, sans pagination.
- [ ] Un impact enregistré depuis l'écran de saisie (STORY-06a) pour ce tireur apparaît dans cet historique sans rechargement manuel nécessaire au retour sur l'écran Book.
- [ ] Le taux d'arrêt exclut bien `poteau` et `hors_cadre` du calcul (vérifié avec un jeu de données de test mixte).

## Hors scope
- Heatmaps croisées terrain × cage (STORY-07b).
- Filtres par match/contexte dans l'historique (V2, hors scope PRD).

## Dépend de
STORY-02, STORY-04, STORY-06a

## Taille
M
