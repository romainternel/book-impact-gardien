# E2E — STORY-12 : Écran Matchs

## Méthode
Diff cache-busté comme preuve de déploiement (cf. recommandation méthodologique STORY-10) + tests locaux exhaustifs contre le vrai backend.

## Parcours testés (local, contre le vrai backend Supabase)
1. Point critique : `getMatchs()` avec embedding double-FK désambiguïsé — le match de test STORY-08 s'affiche avec les deux noms d'équipes correctement résolus.
2. Validation "équipes identiques" → erreur affichée, formulaire préservé.
3. Correction sans retaper les champs déjà valides → création réussie.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | 4 fichiers modifiés, tous identiques au local |
| Embedding double-FK (local) | ✅ | Noms des deux équipes correctement résolus |
| Validation + préservation du formulaire (local) | ✅ | Bug initial corrigé et revérifié |
| Création réelle (local) | ✅ | Match créé, apparaît immédiatement avec les bons noms |

## Verdict
**CONFIRMÉ**
