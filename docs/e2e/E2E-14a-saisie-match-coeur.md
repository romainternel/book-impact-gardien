# E2E — STORY-14a : Écran Saisie Match, boucle cœur

## Méthode
Diff cache-busté (déploiement confirmé identique au local) + tests locaux exhaustifs contre le vrai backend, incluant la vérification de bout en bout dans le Book (consommateur en aval déjà en production).

## Parcours testés (local, contre le vrai backend Supabase)
1. Flow `but` complet (résultat + zone_tir + zone_cage + joueur équipe A) → impact créé, `match_id` correct.
2. Flow `non_but` complet (résultat + zone_tir + joueur équipe B, cage verrouillée) → impact créé, `zone_cage: null`.
3. Vérification bout-en-bout dans le Book du joueur : badge "Non-but" correctement libellé/coloré (mitigation risque #1), heatmap terrain à jour (0/1 sur la zone correcte).

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | 4 fichiers modifiés, tous identiques au local |
| Flow `but` (local) | ✅ | Impact complet et correct en base |
| Flow `non_but` (local) | ✅ | `zone_cage: null`, cage restée verrouillée à l'écran |
| Alimentation du Book (local) | ✅ | Badge "Non-but" correct, heatmap à jour — la décision produit centrale de cette extension (mode Match alimente le Book existant) fonctionne réellement |

## Verdict
**CONFIRMÉ**
