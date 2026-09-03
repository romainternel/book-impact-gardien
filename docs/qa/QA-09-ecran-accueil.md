# QA — STORY-09 : Écran Accueil

## Critères validés ✅
- ✅ Trois cartes (Book par tireur / Saisir un match / Paramètres), la première navigue vers l'écran tireur existant inchangé.
- ✅ Accessible uniquement après sélection gardien — `main.js` et `screen-gardien.js` pointent bien vers `accueil` (vérifié dans le code et par navigation réelle).
- ✅ Lien "Changer de gardien" fonctionnel depuis Accueil.
- ✅ Mode Book par tireur intégralement fonctionnel après le changement de routage (recherche tireur vérifiée après correction du bouton retour).

## Bug trouvé et corrigé pendant le développement
- Bouton retour de l'écran tireur pointait vers `gardien` au lieu d'`accueil` — aurait cassé la cohérence de navigation (retour sautant l'étape de choix de mode). Corrigé et revérifié.

## Régression
- Aucune régression détectée sur le mode Book par tireur (STORY-04 à 07b).

## Bugs trouvés (restants)
Aucun.

## Verdict
**PASSED**
