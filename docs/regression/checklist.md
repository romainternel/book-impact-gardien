# Checklist de régression — Book Impact Gardien

Checklist vivante, mise à jour à chaque story validée par le QA (et l'E2E Tester quand il intervient).

| Feature | Introduite | Critère de bon fonctionnement | Criticité | Dernière vérification OK |
|---|---|---|---|---|
| Squelette SPA se charge sans erreur bloquante | STORY-01 | `https://romainternel.github.io/book-impact-gardien/` affiche le contenu de `#app` (pas de page blanche), aucune erreur console autre que le 404 `favicon.ico` connu | Critique | 2026-09-02 (E2E `docs/e2e/E2E-01-setup-projet.md`) |
| Fichiers `js/vendor/*` et `css/zones.css` identiques à l'export `fenix-terrain-zones-export/` | STORY-01 | `git diff` vide entre les deux emplacements | Critique | 2026-09-02 (Code Review `docs/code-review/STORY-01.md`) |
| Rendu lisible sur viewport mobile (375×667) | STORY-01 | Texte centré, pas de débordement horizontal | Important | 2026-09-02 (E2E `docs/e2e/E2E-01-setup-projet.md`) |
