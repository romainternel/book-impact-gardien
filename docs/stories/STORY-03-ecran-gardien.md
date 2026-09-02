# STORY-03 — Écran Sélection gardien

**En tant que** gardien qui ouvre l'app,
**Je veux** choisir mon profil en un tap (ou le retrouver déjà sélectionné si j'ai déjà utilisé l'app),
**Afin de** ne jamais avoir à me ré-identifier à chaque session.

## Contexte technique
- Zone concernée : `js/screens/screen-gardien.js`, `js/state.js` (persistance).
- Maquette : `docs/design/book-impact-gardien.md` — Écran 1.
- Persistance : `localStorage['bookimpact.gardien']` = `{id, nom}`. Au démarrage (`main.js`), si cette clé existe et référence un gardien valide, sauter directement à l'écran suivant (Écran 2 — sélection tireur, dont l'implémentation arrive en STORY-04 ; en attendant, prévoir un écran placeholder de destination).
- Utilise `getGardiens()` et `createGardien()` de `api.js` (STORY-02).
- Styles : boutons résultat/cartes utilisent les tokens `--panel`, `--panel-2`, `--border`, `--t1` de `app.css` (STORY-01) — pas de nouvelle couleur inventée ici.

## Critères d'acceptation
- [ ] La liste des gardiens existants s'affiche (nom), un tap sélectionne et navigue vers l'écran suivant.
- [ ] "+ Nouveau gardien" ouvre un champ inline, la création insère en base puis sélectionne automatiquement le nouveau gardien.
- [ ] Après sélection, `localStorage['bookimpact.gardien']` contient le gardien choisi.
- [ ] Au rechargement de la page avec ce `localStorage` déjà rempli, cet écran est sauté (navigation directe à l'écran suivant).
- [ ] Un lien "Changer de gardien" est prévu dans le header partagé (même s'il n'est câblé que sur cet écran pour l'instant — les autres écrans le récupéreront en l'important depuis un composant header commun).
- [ ] État vide (aucun gardien en base) : seul "+ Nouveau gardien" est visible.
- [ ] État erreur réseau (échec `getGardiens()`) : message + bouton Réessayer, pas d'écran blanc silencieux.

## Hors scope
- Édition/suppression d'un gardien existant.
- Écran de sélection tireur (STORY-04).

## Dépend de
STORY-01, STORY-02

## Taille
S
