# Code Review — STORY-03 : Écran Sélection gardien

## Conformité Architecture
- Structure conforme à `docs/architecture.md` §1 (`js/screens/screen-gardien.js`, persistance via `state.js`). ✅
- `router.js` étendu avec un `onMount` optionnel — extension minimale, rétrocompatible (le "placeholder" de STORY-01 continue de fonctionner sans changement), nécessaire pour tout écran chargeant des données async. Cohérent avec l'esprit "simple et solide" de l'architecte plutôt que d'introduire un framework de gestion d'état.

## Réutilisation vs duplication
- `header.js` créé comme composant partagé dès cette première utilisation, conformément à la story — pas de duplication du markup header quand STORY-04+ le réutiliseront.
- `escapeHtml` centralisé dans `util.js` plutôt que dupliqué inline — bon réflexe pour les prochains écrans (tireur, book) qui afficheront aussi du texte utilisateur.

## Scope
- Fichiers touchés : `js/util.js`, `js/router.js`, `js/screens/header.js`, `js/screens/screen-gardien.js`, `js/main.js`, `index.html`, `css/app.css`. Tout est directement requis par la story ; aucun débordement vers STORY-04 (le tireur reste un placeholder).

## Lisibilité et maintenabilité
- Pattern `render → bind → reRender` cohérent et documenté par l'exemple (le commentaire d'en-tête de `router.js` renvoie explicitement vers ce fichier). Un futur écran peut copier ce pattern sans deviner.
- État local du screen (`_gardienScreen`) clairement scopé au module, pas de fuite dans `state.js` global (qui reste réservé à ce qui doit survivre entre écrans).

## Gestion d'erreurs
- `loadScreenGardien` capture l'erreur et bascule en état `error` avec retry — pas de `try/catch` qui ré-avale sans affichage. Conforme au style déjà établi en STORY-01/02.
- `createGardien` échoué bascule aussi en état erreur plutôt que de laisser le formulaire inline dans un état incohérent.

## Sécurité basique
- `escapeHtml` appliqué systématiquement sur `g.nom` avant interpolation dans le HTML généré — bonne pratique même en outil interne (un gardien nommé avec des caractères HTML ne casse pas le rendu). Rien à signaler au Security Auditor, pas de nouvelle ressource backend touchée par cette story (les policies `gardiens` ont déjà été auditées en STORY-02).

## Taille et complexité
- Story S conforme. L'extension de `router.js` (onMount) est minimale et directement motivée par le besoin réel de cette story, pas une anticipation spéculative.

## Verdict
**APPROUVÉ**
