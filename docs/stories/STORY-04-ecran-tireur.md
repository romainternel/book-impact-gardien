# STORY-04 — Écran Sélection / création tireur

**En tant que** gardien ayant sélectionné mon profil,
**Je veux** retrouver rapidement un tireur déjà connu ou en créer un nouveau en quelques champs,
**Afin de** arriver le plus vite possible sur l'écran de saisie sans friction.

## Contexte technique
- Zone concernée : `js/screens/screen-tireur.js`.
- Maquette : `docs/design/book-impact-gardien.md` — Écran 2.
- Utilise `searchTireurs(query)`, `getTireursRecents(gardienId, limit=5)`, `createTireur({...})` de `api.js`.
- Recherche filtrée côté client si le volume de tireurs reste faible au démarrage du projet (cf. critère de bascule architecture §7 — full-text Postgres seulement si le volume grossit) ; sinon appel `searchTireurs` à chaque frappe avec un debounce ~200ms.
- Le mini-formulaire de création est **inline** (pas un nouvel écran) — seul `nom` est obligatoire.
- Poste : liste fixe `ailier_d, ailier_g, arriere_d, arriere_g, demi_centre, pivot` (confirmée en `docs/brief.md` question 4).

## Critères d'acceptation
- [ ] Écran vide (pas de recherche) : affiche les tireurs récemment consultés par ce gardien (`getTireursRecents`), max 5.
- [ ] La recherche filtre en temps réel sur nom + club.
- [ ] Tap sur un tireur → navigation directe vers l'écran de saisie (placeholder en attendant STORY-06a) avec le contexte tireur chargé en `state.js`.
- [ ] Si aucun résultat exact, une ligne "+ Créer '...'" apparaît et ouvre le mini-formulaire inline.
- [ ] La création avec seulement le nom rempli fonctionne (les autres champs sont `null` en base).
- [ ] Après création, navigation directe vers l'écran de saisie comme pour un tireur existant.
- [ ] État erreur réseau géré comme en STORY-03 (pas d'écran blanc silencieux).

## Hors scope
- Édition d'un tireur existant après création (Should Have du PRD, pas dans cette story).
- Écran de saisie d'impact lui-même (STORY-06a).

## Dépend de
STORY-02, STORY-03

## Taille
M
