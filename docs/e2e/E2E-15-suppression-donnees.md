# E2E — STORY-15 : Suppression de données depuis l'app

## Incident de déploiement rencontré
Le job GitHub Actions "pages build and deployment" est resté bloqué en `in_progress` pendant 7m22s (contre ~40s pour tous les runs précédents de cette session) avant de se terminer avec succès. Vérifié via `gh run list` : aucun autre run de la journée n'a dépassé 43s. Incident d'infrastructure GitHub ponctuel, sans lien avec le code — le déploiement a fini par aboutir normalement.

## Parcours testés
1. Local (5 écrans, cf. QA-15) : tous les flows de suppression avec de vrais dialogues navigateur.
2. Live : diff cache-busté (déploiement confirmé identique une fois le build terminé) + un flow de suppression complet rejoué en direct contre le vrai backend (création d'un gardien de test, confirmation native, suppression réelle vérifiée par relecture).

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | 8 fichiers modifiés, tous identiques au local (après résolution de l'incident de build) |
| Suppression gardien (live) | ✅ | Dialogue natif déclenché, confirmé, suppression réelle vérifiée en base |

## Verdict
**CONFIRMÉ**
