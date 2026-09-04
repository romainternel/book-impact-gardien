# E2E — STORY-18a : Réordonnancement de l'écran de saisie match

## Environnement de test
Serveur statique local (`http-server`) pointant sur le backend Supabase de production, méthodologie constante depuis STORY-10. Match réel utilisé : "J01 · BILLERE vs FENIX".

## Parcours testés (Playwright, navigateur réel)

1. Gardien "Gabin" → Accueil → "Saisir un match" → "Lancer" sur le match réel → écran de saisie atteint.
2. **Ordre des sections** : Résultat → Zone de cage → Zone de tir confirmé visuellement à 3 largeurs (capture).
3. **Palier < 480px** (375px) : pile verticale complète, capture conforme.
4. **Palier 480-759px, à la borne exacte 759px** (le point précis où le QA a détecté puis fait corriger une zone morte) : capture confirmant les rosters BILLERE/FENIX en rangée à 2 colonnes sous le bloc central, liserés de couleur d'équipe visibles.
5. **Palier ≥ 760px** (1000px) : capture confirmant les rosters en colonnes latérales de part et d'autre du bloc central.
6. Console navigateur surveillée sur l'ensemble des 5 sessions locales utilisées pendant tout le cycle de contrôle de cette story (Developer, Code Review, QA, E2E) : **0 erreur JS**, seules entrées : des 404 `favicon.ico` sans rapport.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Ordre Résultat → Cage → Terrain | ✅ | Conforme aux 3 largeurs |
| Palier < 480px : pile verticale | ✅ | Capture conforme |
| Palier 759px exact (ex-zone morte) : 2 colonnes | ✅ | Capture confirme le correctif QA en conditions réelles |
| Palier ≥ 760px : colonnes latérales + liserés d'équipe | ✅ | Capture conforme, correctif Code Review confirmé |
| Absence d'erreur console sur l'ensemble du cycle | ✅ | 0 erreur JS sur 5 sessions locales |

## Écarts avec le verdict QA
Aucun. Confirme le verdict `PASSED` du QA, y compris visuellement (captures) le correctif de la zone morte à 759px qui n'avait été vérifié par le QA que via `getComputedStyle`/`matchMedia`, pas par capture d'écran.

## Verdict
**CONFIRMÉ**
