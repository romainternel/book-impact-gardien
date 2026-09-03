# E2E — STORY-14b : Écran Saisie Match, robustesse

## Méthode
Diff cache-busté (déploiement confirmé identique au local) + tests locaux exhaustifs contre le vrai backend.

## Parcours testés (local, contre le vrai backend Supabase)
1. Anti double-tap : triple-tap sur bouton joueur pendant écriture ralentie → 1 seul impact.
2. Bandeau de confirmation avec nom du joueur + annulation → suppression réelle vérifiée.
3. Erreur simulée + retry → sélection conservée, ré-essai réussi.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | Fichier identique au local |
| Anti double-tap (local) | ✅ | 1 seul impact malgré triple-tap |
| Bandeau + annulation (local) | ✅ | Libellé exact avec nom du joueur, suppression réelle confirmée |
| Erreur + retry (local) | ✅ | Sélection conservée, ré-essai réussi |

## Verdict
**CONFIRMÉ**
