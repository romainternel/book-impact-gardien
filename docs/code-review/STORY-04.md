# Code Review — STORY-04 : Écran Sélection / création tireur

## Conformité Architecture
- `js/screens/screen-tireur.js` conforme à la structure attendue, utilise `getTireursRecents`/`searchTireurs`/`createTireur` de `api.js` sans les modifier. ✅
- Extension de `header.js` (support `back`) cohérente avec l'intention "composant partagé" posée en STORY-03 — pas de duplication de markup header.

## Réutilisation vs duplication
- `POSTES`/`posteLabel()` définis une seule fois dans `screen-tireur.js` ; à surveiller si STORY-07a (Book) a besoin du même référentiel — actuellement acceptable de ne pas le partager tant qu'un seul écran l'utilise (pas d'abstraction prématurée).

## Scope
- Fichiers touchés : `js/screens/screen-tireur.js` (nouveau), `js/screens/header.js`, `js/screens/screen-gardien.js` (2 lignes : destination de navigation `placeholder`→`tireur`), `js/main.js`, `index.html`, `css/app.css`. Tout directement requis.
- Un bug de layout header (titre poussé à droite par `justify-content:space-between` avec seulement 2 enfants) a été détecté et corrigé pendant le développement — correction propre (`.header-left` regroupe flèche + titre), n'affecte pas rétroactivement le rendu de l'écran gardien (vérifié).

## Lisibilité et maintenabilité
- Séparation claire "coquille" (`renderScreenTireur`, header + input de recherche, rendus une seule fois) vs "corps de liste" (`renderTireurListBody`, re-rendu à chaque changement d'état) — évite explicitement de perdre le focus du champ de recherche à chaque frappe. Décision technique non triviale, commentée dans le fichier.
- Lecture des valeurs du formulaire de création directement depuis le DOM au moment du submit (pas de state JS dupliqué pour chaque champ) — plus simple et évite un bug de synchronisation, cohérent avec le choix de ne pas re-render le formulaire pendant la saisie.

## Gestion d'erreurs
- `loadTireurRecents`/`runTireurSearch`/`createTireur` (submit) basculent tous en état `error` avec retry, jamais d'exception avalée silencieusement.

## Sécurité basique
- `escapeHtml` appliqué sur tous les champs utilisateur affichés (nom, club, poste, latéralité, requête de recherche réinjectée dans le placeholder de création). Rien de nouveau à signaler au Security Auditor (table `tireurs` déjà auditée en STORY-02, aucune nouvelle opération introduite — `insert`/`select` déjà couverts, pas d'`update`/`delete` utilisés par cet écran).

## Taille et complexité
- Story M conforme. La logique de correspondance exacte (`hasExactMatch`) ajoute un peu de complexité mais correspond précisément à l'intention du critère d'acceptation ("si aucun résultat exact") — pas de sur-ingénierie.

## Verdict
**APPROUVÉ**
