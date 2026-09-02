# STORY-01 — Setup projet et squelette SPA

**En tant que** développeur qui va livrer les stories suivantes,
**Je veux** une structure de fichiers en place, les composants de zones copiés à l'identique, les tokens visuels posés, et un premier déploiement GitHub Pages fonctionnel,
**Afin de** pouvoir livrer chaque écran ensuite sans reposer les fondations à chaque fois.

## Contexte technique
- Zone concernée : racine du projet (nouveau projet, rien à casser).
- Créer l'arborescence définie par `docs/architecture.md` §1 :
  ```
  /index.html
  /css/zones.css        ← copie strictement inchangée de fenix-terrain-zones-export/zones.css
  /css/app.css           ← nouveau, tokens du Visual Crafter (docs/visual/book-impact-gardien.md §1-2)
  /js/vendor/terrain-zones.js    ← copie strictement inchangée
  /js/vendor/goal-cage-zones.js  ← copie strictement inchangée
  /js/state.js
  /js/router.js
  /js/main.js
  /js/screens/ (dossier vide, rempli par les stories suivantes)
  ```
- `index.html` charge les scripts dans l'ordre de dépendance décrit en architecture (`vendor/*` puis le reste), en balises `<script>` classiques (pas de `type="module"`).
- `app.css` définit les tokens CSS de `docs/visual/book-impact-gardien.md` §1 (palette) et §2 (typographie) sur `:root`, sans redéfinir les tokens déjà présents dans `zones.css`.
- `router.js` : squelette minimal — un objet `state.currentScreen` et une fonction `renderScreen()` qui vide `#app` et appelle la fonction de rendu de l'écran courant (les écrans eux-mêmes n'existent pas encore, prévoir juste un écran "placeholder" qui affiche "Book Impact Gardien" pour valider le pipeline).
- Repo GitHub créé, GitHub Pages activé, premier déploiement du placeholder vérifié en ligne.

## Critères d'acceptation
- [ ] L'arborescence de fichiers correspond exactement à `docs/architecture.md` §1.
- [ ] `git diff` entre `js/vendor/terrain-zones.js` et `fenix-terrain-zones-export/terrain-zones.js` est vide (idem `goal-cage-zones.js` et `zones.css`).
- [ ] `app.css` contient tous les tokens listés dans `docs/visual/book-impact-gardien.md` §1, sans dupliquer/redéfinir ceux déjà dans `zones.css`.
- [ ] L'URL GitHub Pages du projet affiche le placeholder sans erreur console.
- [ ] Aucune dépendance à un bundler ou gestionnaire de paquets côté build (pas de `package.json` requis pour servir le site).

## Hors scope
- Tout écran fonctionnel (gardien, tireur, saisie, book).
- Connexion Supabase (story suivante).

## Dépend de
Aucune

## Taille
S
