# E2E — STORY-09 : Écran Accueil

## Parcours testés
1. Local : routage post-gardien vers Accueil, navigation vers les 3 modes, retour cohérent (accueil, pas gardien).
2. Live : diff cache-busté de tous les fichiers modifiés (identiques), rendu visuel confirmé identique au local.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | 6 fichiers modifiés, tous identiques au local |
| Routage vers Accueil (local + live) | ✅ | `state.currentScreen === "accueil"` après chargement avec gardien mémorisé |
| Navigation vers Book par tireur (local) | ✅ | Écran tireur inchangé, fonctionnel |
| Retour cohérent (local) | ✅ | Ramène à `accueil`, pas à `gardien` |
| Rendu visuel (live) | ✅ | Identique au local |

## Verdict
**CONFIRMÉ**
