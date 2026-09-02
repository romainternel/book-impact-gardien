# E2E — STORY-01 : Setup projet et squelette SPA

**Environnement testé** : `https://romainternel.github.io/book-impact-gardien/` (live, pas seulement local) — commit `107250f`, build GitHub Pages confirmé `built` avant test.

## Parcours testés
1. **Chargement initial de la page live** — navigation Playwright vers l'URL GitHub Pages, capture des messages console, screenshot plein écran.
2. **Rendu sur viewport mobile** (375×667, gabarit iPhone SE — proche de l'appareil cible d'usage réel du gardien en session vidéo) — redimensionnement puis nouvelle capture.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Chargement live desktop | ✅ | Titre d'onglet "Book Impact Gardien" correct, placeholder centré affiché, fond navy conforme aux tokens `--bg`. Un seul message console : `404 favicon.ico` — non bloquant, aucun impact fonctionnel, hors scope de la story. |
| Rendu mobile 375×667 | ✅ | Texte lisible, centré, aucun débordement horizontal, aucune barre de scroll parasite. |

Captures d'écran vérifiées visuellement pendant le test (desktop plein écran + mobile) — non conservées dans le repo (pas de convention de stockage d'assets binaires de test à ce stade du projet), mais chaque capture a été inspectée avant suppression.

## Écarts avec le verdict QA
Aucun. Le verdict PASSED du QA (`docs/qa/QA-01-setup-projet.md`) est confirmé en conditions réelles, sur l'environnement live et non seulement en local.

## Verdict
**CONFIRMÉ**
