# Checklist de régression — Book Impact Gardien

Checklist vivante, mise à jour à chaque story validée par le QA (et l'E2E Tester quand il intervient).

| Feature | Introduite | Critère de bon fonctionnement | Criticité | Dernière vérification OK |
|---|---|---|---|---|
| Squelette SPA se charge sans erreur bloquante | STORY-01 | `https://romainternel.github.io/book-impact-gardien/` affiche le contenu de `#app` (pas de page blanche), aucune erreur console autre que le 404 `favicon.ico` connu | Critique | 2026-09-02 (E2E `docs/e2e/E2E-01-setup-projet.md`) |
| Fichiers `js/vendor/*` et `css/zones.css` identiques à l'export `fenix-terrain-zones-export/` | STORY-01 | `git diff` vide entre les deux emplacements | Critique | 2026-09-02 (Code Review `docs/code-review/STORY-01.md`) |
| Rendu lisible sur viewport mobile (375×667) | STORY-01 | Texte centré, pas de débordement horizontal | Important | 2026-09-02 (E2E `docs/e2e/E2E-01-setup-projet.md`) |
| Picker terrain : clic résout la bonne zone, y compris sur les zones concaves (69MG/69MC/69MD) | STORY-05 | `bindCourtZonePicker` retourne le code de zone correct pour un clic au centre géométrique réel de chaque zone | Critique | 2026-09-02 (E2E `docs/e2e/E2E-05-zone-picker-terrain.md`) |
| Client Supabase live opérationnel (`getGardiens()` répond depuis GitHub Pages) | STORY-02 | Aucune erreur console au-delà du 404 favicon connu ; `getGardiens()` retourne un tableau | Critique | 2026-09-02 (vérifié en direct sur `https://romainternel.github.io/book-impact-gardien/`) |
| Policies RLS least-privilege appliquées (`gardiens`/`tireurs`/`impacts`) | STORY-02 | Update/delete bloqués là où non prévu, autorisés là où prévu — vérifié contre des lignes réelles, pas des ids inventés | Critique | 2026-09-02 (Security Audit `docs/security/story-02-supabase-rls.md`) |
| Écran gardien : liste/création/sélection/persistance localStorage | STORY-03 | Sélection ou création → `localStorage` rempli → écran suivant atteint direct au reload | Critique | 2026-09-02 (E2E `docs/e2e/E2E-03-ecran-gardien.md`) |
| Écran tireur : recherche/récents/création/correspondance exacte | STORY-04 | Recherche filtre en direct, création fonctionne nom seul, correspondance exacte masque "+ Créer" | Critique | 2026-09-02 (E2E `docs/e2e/E2E-04-ecran-tireur.md`) |
| Saisie impact : auto-save 2-3 taps, verrouillage cage, préremplissage type/main | STORY-06a | `hors_cadre`=2 taps, `but`/`arret`/`poteau`=3 taps, données correctes en base | Critique | 2026-09-02 (E2E `docs/e2e/E2E-06a-saisie-impact-coeur.md`) |
| Saisie impact : anti double-tap, erreur explicite + retry, annulation | STORY-06b | Double-tap = 1 seul impact ; erreur conserve la sélection ; Annuler supprime réellement en base | Critique | 2026-09-02 (E2E `docs/e2e/E2E-06b-saisie-impact-robustesse.md`, annulation re-vérifiée en local contre le vrai backend) |
| Book tireur : stats (tirs/main/zone/arrêt) et historique | STORY-07a | Chiffres exacts sur jeu de données connu, cas limites (<3 tirs, 0 tir) gérés | Critique | 2026-09-02 (E2E `docs/e2e/E2E-07a-book-stats-historique.md`) |
| Book tireur : heatmaps croisées terrain × cage + filtre | STORY-07b | Ratios exacts, filtre par tap fonctionnel, hors_cadre exclu de la cage | Critique | 2026-09-02 (E2E `docs/e2e/E2E-07b-book-heatmaps-croisees.md`) |
| Schéma mode Match (equipes/matchs/colonnes étendues) sans régression sur le schéma existant | STORY-08 | Tireur/impact "à l'ancienne" (sans equipe_id/match_id) toujours insérable ; RLS least-privilege sur les 2 nouvelles tables | Critique | 2026-09-03 (Security Audit `docs/security/story-08-mode-match-rls.md`, régression vérifiée en direct) |
