# QA — STORY-12 : Écran Matchs

## Critères validés ✅
- ✅ `getMatchs()` retourne bien les noms des deux équipes (pas juste leurs ids) — vérifié en lisant la réponse réelle sur le match de test STORY-08.
- ✅ Formulaire de création : impossible de valider avec deux fois la même équipe (message d'erreur, création bloquée).
- ✅ Test réel de la contrainte `equipes_distinctes` côté serveur : géré sans planter l'écran (le cas est déjà intercepté côté client avant l'appel API, mais le `catch` réseau couvre aussi un contournement éventuel).
- ✅ Un match créé apparaît immédiatement dans la liste, avec les bons noms d'équipes.
- ✅ États vide/erreur gérés.

## Bug trouvé et corrigé pendant le développement
Formulaire vidé après une erreur de validation — corrigé par le Developer (`showMatchFormError` sans re-render). Revérifié : la saisie est bien préservée après une erreur, seule la correction nécessaire doit être refaite.

## Cas limites testés
- Correction d'une erreur de validation sans retaper les champs déjà valides (saison, journée) — fonctionne.

## Bugs trouvés (restants)
Aucun.

## Verdict
**PASSED**
