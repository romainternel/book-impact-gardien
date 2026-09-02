# E2E — STORY-07a : Book tireur, stats et historique

## Parcours testés
1. Local : jeu de données réel (7 impacts variés), tous les chiffres de stats vérifiés exacts, cas limites (< 3 tirs, 0 tir, erreur) vérifiés.
2. Live : diff cache-busté de tous les fichiers modifiés (identiques), navigation fraîche (scripts + CSS rechargés explicitement dès le départ pour éviter la panne de cache des stories précédentes), 3 impacts créés en direct, stats vérifiées exactes (3 tirs, 100% Main G, "Aile G", 33% arrêt).

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | `css/app.css`, `index.html`, `js/screens/screen-book.js` identiques au local |
| Stats avec données réelles (local) | ✅ | 7 tirs, 71% Main D, "Aile D", 40% arrêt — exact |
| Cas limites (local) | ✅ | < 3 tirs, 0 tir, erreur réseau tous corrects |
| Stats avec données réelles (live) | ✅ | 3 tirs, 100% Main G, "Aile G", 33% arrêt — exact, contre le vrai backend |

Rechargement forcé de tous les scripts/CSS d'écran effectué **avant** tout test cette fois (leçon des stories précédentes) — aucune anomalie de cache rencontrée durant cette passe.

## Écart avec le verdict QA
Aucun écart fonctionnel. Note produit déjà relayée par le QA (interprétation de "poste favori") — hors du périmètre de vérification E2E (comportement, pas décision produit).

## Verdict
**CONFIRMÉ**
