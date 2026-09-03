# STORY-09 — Écran Accueil (choix du mode)

**En tant que** gardien qui vient de sélectionner son profil,
**Je veux** choisir entre le Book par tireur, le mode Match et les Paramètres,
**Afin de** accéder au bon flux sans que l'app ne présuppose lequel je veux utiliser.

## Contexte technique
- Zone concernée : nouveau `js/screens/screen-accueil.js`.
- Maquette : `docs/design/mode-match.md` — Écran Accueil.
- **Changement sur l'existant** : `js/main.js` route désormais vers `renderScreen("accueil")` (au lieu de `"tireur"`) après chargement d'un gardien depuis `localStorage`, et `screen-gardien.js` fait de même après sélection/création d'un gardien (2 call sites, comme lors du passage `placeholder`→`tireur` en STORY-04).
- Réutilise `renderAppHeader` avec `showChangeGardien: true` (le gardien est déjà connu à ce stade).

## Critères d'acceptation
- [ ] Trois cartes : "📖 Book par tireur" (→ `renderScreen("tireur")`, écran STORY-04 inchangé), "⚽ Saisir un match" (→ `renderScreen("selection-match")`, cible livrée en STORY-13), "⚙️ Paramètres" (→ `renderScreen("parametres")`, cible livrée en STORY-10).
- [ ] Accessible uniquement après sélection d'un gardien (comme les autres écrans post-sélection) — testé en vérifiant que `main.js` et `screen-gardien.js` pointent bien vers `accueil`.
- [ ] Le lien "Changer de gardien" du header fonctionne comme sur les autres écrans (retour à l'écran gardien).
- [ ] Le mode Book par tireur (écran tireur, saisie, book) reste intégralement fonctionnel après ce changement de routage — non-régression explicite à vérifier.

## Hors scope
- Contenu des écrans Paramètres et Sélection Match eux-mêmes (stories suivantes) — les liens peuvent temporairement afficher le fallback "écran introuvable" du routeur tant que ces stories ne sont pas livrées, comme déjà pratiqué pour le lien Book en STORY-06a.

## Dépend de
Aucune

## Taille
S
