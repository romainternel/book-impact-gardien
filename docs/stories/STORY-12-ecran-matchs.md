# STORY-12 — Écran Matchs

**En tant que** utilisateur qui a préparé ses équipes/joueurs,
**Je veux** créer un match (saison, journée, deux équipes) et voir la liste des matchs existants,
**Afin de** pouvoir ensuite lancer une saisie sur ce match précis.

## Contexte technique
- Zone concernée : nouveau `js/screens/screen-matchs.js`, `js/api.js` (`getMatchs()`, `createMatch({saison, journee, equipe_a_id, equipe_b_id})`).
- **Point d'attention critique** (`docs/risks/mode-match.md` #6, `docs/arch/mode-match.md` §4) : `matchs` a deux FK vers `equipes` — vérifier le nom réel des contraintes généré en STORY-08 et utiliser la syntaxe d'embedding désambiguïsée (`equipes!matchs_equipe_a_id_fkey`) dans `getMatchs()`. Ne pas utiliser `select("*, equipes(nom)")` (ambigu, échoue ou erreur peu claire).
- Formulaire de création : saison (texte libre), journée (liste fixe J01-J22, `<select>`), équipe A / équipe B (deux `<select>` alimentés par `getEquipes()`).
- Maquette : `docs/design/mode-match.md` — Écran Matchs.

## Critères d'acceptation
- [ ] `getMatchs()` retourne bien les noms des deux équipes (pas juste leurs ids) — vérifié en lisant la réponse réelle de la requête, pas en supposant que l'embedding a fonctionné.
- [ ] Formulaire de création : impossible de choisir deux fois la même équipe côté UI (en plus de la contrainte SQL déjà en place) — cohérence avec la contrainte `equipes_distinctes`.
- [ ] Un match créé apparaît immédiatement dans la liste, triée par journée puis date de création.
- [ ] Test réel de la contrainte `equipes_distinctes` : tentative de création avec équipe A = équipe B rejetée côté API, gérée sans planter l'écran (message d'erreur, pas un écran blanc).
- [ ] États vide/erreur gérés (pattern déjà établi).

## Hors scope
- Édition/suppression d'un match.
- Filtres avancés (par saison, par équipe) au-delà d'un tri simple.

## Dépend de
STORY-08, STORY-10

## Taille
M
