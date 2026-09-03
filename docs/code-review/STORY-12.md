# Code Review — STORY-12 : Écran Matchs

## Conformité Architecture
- `getMatchs()` utilise exactement la syntaxe d'embedding désambiguïsée prescrite par `docs/arch/mode-match.md` §4 (`equipes!matchs_equipe_a_id_fkey`), avec les noms de contraintes réels confirmés en STORY-08. Vérifié en conditions réelles, pas supposé correct. ✅
- `createMatch()` conforme à `docs/arch/mode-match.md` §5. ✅

## Réutilisation vs duplication
- CSS : `.inline-create-tireur`/`.inline-create-match` généralisés sur le même sélecteur plutôt que deux blocs de règles dupliqués — bon réflexe.
- Après création, le match est enrichi client-side avec les objets `equipe_a`/`equipe_b` déjà chargés (`s.equipes`) plutôt qu'un second aller-retour réseau — cohérent avec le pattern déjà établi en STORY-11 (apparition immédiate sans rechargement).

## Bug trouvé et corrigé pendant le développement
Le formulaire de création se vidait entièrement après une erreur de validation (équipes identiques ou champs manquants), parce que le premier jet affichait l'erreur via un `_matchsScreen.formError` qui déclenchait un `refreshMatchsListBody()` complet — regénérant tout le HTML du formulaire et perdant la saisie déjà faite. Corrigé en remplaçant ce mécanisme par `showMatchFormError()`, qui met à jour un élément d'erreur dédié dans le DOM sans re-render, laissant les champs déjà remplis intacts. Revérifié : après une erreur "équipes identiques", la saison reste renseignée, seule la correction de l'équipe B suffit pour retenter.

## Scope
- Fichiers touchés : `js/screens/screen-matchs.js` (nouveau), `js/api.js` (2 fonctions), `index.html`, `css/app.css`. Conforme.

## Gestion d'erreurs
- Distinction correcte entre erreur de validation (message inline, formulaire préservé) et erreur réseau au chargement de la liste (état `error` plein écran avec retry) — les deux cas sont sémantiquement différents et traités différemment à raison.

## Sécurité basique
Rien de nouveau — `matchs`/`equipes` déjà auditées en STORY-08.

## Taille et complexité
Story M conforme.

## Point vérifié en conditions réelles
Le point le plus critique de cette story (double FK `matchs → equipes`) a été vérifié en conditions réelles : le match de test créé en STORY-08 s'affiche avec les deux noms d'équipes correctement résolus via `getMatchs()`. Création d'un nouveau match testée avec succès après correction du bug de formulaire, y compris le cas de rejet (équipes identiques) suivi d'une correction sans perte de saisie.

## Verdict
**APPROUVÉ**
