# E2E — STORY-13 : Écran Sélection Match

## Méthode
Diff cache-busté (déploiement confirmé identique au local) + tests locaux exhaustifs contre le vrai backend.

## Parcours testés
1. Liste réelle de matchs affichée.
2. Clic "Lancer" → `state.matchCourant` peuplé avec les deux équipes et leurs rosters.
3. États vide/erreur simulés.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | 3 fichiers modifiés, tous identiques au local |
| Liste + Lancer (local) | ✅ | `state.matchCourant` correctement formé, joueurs des deux équipes résolus |
| États vide/erreur (local) | ✅ | Conformes |

## Verdict
**CONFIRMÉ**
