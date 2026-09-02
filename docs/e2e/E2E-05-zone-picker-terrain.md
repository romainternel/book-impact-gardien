# E2E — STORY-05 : Composant zone-picker terrain

**Environnement testé** : `http://localhost:8099/index.html` (local, le composant n'est câblé dans aucun écran live pour l'instant — normal, STORY-06a s'en chargera).

## Parcours testés
1. Chargement de la page avec `zone-picker.js` inclus — vérification qu'aucune erreur console n'est introduite par le nouveau script.
2. Rendu du picker + clic réel (événement `MouseEvent` dispatché au point géométrique exact du centre de `69MC`, zone concave à risque) → vérification que le callback de `bindCourtZonePicker` reçoit la bonne zone **et** que le re-rendu applique l'état visuel actif au bon polygone.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Chargement sans erreur | ✅ | Seul message console : `404 favicon.ico`, préexistant depuis STORY-01, sans lien avec ce composant. |
| Clic sur zone concave `69MC` | ✅ | `selected === "69MC"` et `.zone-pick.active` correspond au bon polygone après re-rendu. |

## Écarts avec le verdict QA
Aucun. Confirme indépendamment le verdict PASSED du QA (`docs/qa/QA-05-zone-picker-terrain.md`), avec une exécution fraîche (rechargement de page, pas de réutilisation d'état de session précédent).

## Verdict
**CONFIRMÉ**
