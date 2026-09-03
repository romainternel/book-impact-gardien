# E2E — STORY-11 : Écran Joueurs (par équipe)

## Méthode (mise à jour suite à la recommandation de STORY-10)
Conformément à la recommandation méthodologique de `docs/e2e/E2E-10-parametres-equipes.md`, cette passe s'appuie sur le diff cache-busté seul comme preuve de déploiement correct, sans tentative de rendu live pixel-parfait par rechargement à chaud (source d'artefacts de scope JS non représentatifs du produit réel, déjà démontré non fiable).

## Parcours testés (local, contre le vrai backend Supabase)
1. Non-régression du mode Book : recherche + création tireur libre après le refactor `tireur-form-shared.js` — `equipe_id: null` confirmé, navigation vers l'écran de saisie inchangée.
2. Écran Joueurs : liste filtrée par équipe, poste "Gardien de but" affiché correctement, champ Club absent du formulaire, création avec latéralité → apparition immédiate dans la liste, `equipe_id` correct en base.
3. Recherche client-side et état d'erreur simulé.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement | ✅ | 5 fichiers modifiés, tous identiques au local |
| Non-régression Book (local) | ✅ | Tireur libre créé avec `equipe_id: null`, flow inchangé |
| Écran Joueurs (local) | ✅ | Tous les critères vérifiés, capture visuelle inspectée |

## Verdict
**CONFIRMÉ** sur la base du diff de déploiement et des tests locaux exhaustifs contre le vrai backend.
