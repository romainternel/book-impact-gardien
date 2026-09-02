# E2E — STORY-07b : Book tireur, heatmaps croisées

## Parcours testés
1. Local : jeu de données réel (6 impacts), heatmap terrain exacte, heatmap cage exacte, filtre par tap + reset "Tous ✕".
2. Live : diff cache-busté de tous les fichiers modifiés (identiques), rechargement forcé des scripts/CSS avant test, 2 impacts créés en direct, heatmap terrain vérifiée exacte (1/2 sur AILG).

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | `css/app.css`, `js/screens/screen-book.js`, `js/zone-picker.js` identiques au local |
| Heatmap terrain (local) | ✅ | AILD 2/3, 9MC 0/2 (hors_cadre inclus dans le total, exclu de la cage), 6MG 1/1 — exact |
| Heatmap cage (local) | ✅ | 5 cases correspondant aux 5 tirs cadrés, hors_cadre absent |
| Filtre par tap + reset (local) | ✅ | AILD filtre à 3 cases, "Tous ✕" restaure les 5 |
| Heatmap terrain (live) | ✅ | 1/2 exact sur AILG, contre le vrai backend |

## Écart avec le verdict QA
Aucun.

## Verdict
**CONFIRMÉ**
