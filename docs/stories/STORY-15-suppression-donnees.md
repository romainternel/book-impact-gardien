# STORY-15 — Suppression de données depuis l'app (avec confirmation)

**En tant que** utilisateur,
**Je veux** pouvoir supprimer un gardien, un tireur/joueur, une équipe ou un match directement depuis l'app, avec une confirmation avant toute suppression,
**Afin de** corriger une erreur de saisie (doublon, faute de frappe) sans devoir passer par le SQL Editor Supabase.

## Contexte technique
- Zone concernée : `js/api.js` (4 nouvelles fonctions delete), `js/util.js` (helper `confirmAndDelete` partagé), 5 écrans (`screen-gardien.js`, `screen-tireur.js`, `screen-joueurs.js`, `screen-equipes.js`, `screen-matchs.js`), `css/app.css` (`.list-card-row`/`.list-card-delete-btn`).
- Nouvelles policies RLS `delete` sur `gardiens`/`tireurs`/`equipes`/`matchs` (`impacts` a déjà sa policy delete depuis STORY-02, réutilisée pour "Annuler dernier impact").
- **Protection par construction** : les contraintes de clé étrangère existantes (`ON DELETE` par défaut = `RESTRICT` en Postgres) bloquent nativement la suppression d'une ligne encore référencée (ex. équipe avec des joueurs, tireur avec des impacts) — pas de logique de vérification applicative à écrire, juste intercepter l'erreur `23503` et afficher un message clair.
- Confirmation : `window.confirm()` natif (pas de nouveau composant modal — cohérent avec "ne pas réinventer" vu la rareté de l'action).
- Mise à jour de la liste après suppression : filtrage local de l'état déjà chargé (pas de rechargement réseau), cohérent avec le pattern déjà établi en STORY-11.

## Critères d'acceptation
- [ ] Un bouton de suppression (icône) est visible sur chaque ligne des listes gardiens/tireurs/joueurs/équipes/matchs.
- [ ] Le tap déclenche une confirmation (`window.confirm`) nommant l'élément concerné avant toute suppression.
- [ ] Annuler la confirmation → aucune suppression, aucun appel réseau.
- [ ] Confirmer sur un élément sans dépendance → suppression réelle en base, disparition immédiate de la liste sans rechargement réseau.
- [ ] Confirmer sur un élément **avec** dépendance (ex. équipe avec joueurs, gardien avec impacts) → message d'erreur explicite indiquant qu'il faut supprimer les données liées d'abord, l'élément reste dans la liste.
- [ ] Supprimer le gardien actuellement actif (`state.gardienId`) efface aussi le `localStorage` correspondant.
- [ ] Le bouton de suppression ne déclenche jamais l'action de sélection/navigation de la ligne (`stopPropagation`).

## Hors scope
- Suppression d'un impact autre que le tout dernier (déjà couvert par "Annuler", cf. PRD MVP — pas étendu ici).
- Suppression en masse / multi-sélection.
- Confirmation via un composant modal personnalisé (natif suffit).

## Dépend de
STORY-02 (policies RLS existantes), STORY-08 (tables equipes/matchs), STORY-11 (pattern de mise à jour locale de liste)

## Taille
M
