# Book Impact Gardien

Web app pour gardiens de but de handball : enregistrer en 2-3 taps, pendant le visionnage d'une vidéo de match, l'impact de chaque tir adverse subi (zone de tir, zone de cage, résultat, contexte), et consulter ensuite un "book" par tireur adverse avant un futur match. Étendue par le **Mode Match** pour documenter un match complet en direct (équipes, joueurs, saisie double-roster).

## Documentation
- [Contexte projet (CLAUDE.md)](CLAUDE.md)
- [Cahier des charges initial](book-impact-gardien-brief.md)

**Book Impact Gardien (MVP)**
- [Brief](docs/brief.md) · [PRD](docs/prd.md)
- [Design](docs/design/book-impact-gardien.md) · [Visuel](docs/visual/book-impact-gardien.md)
- [Architecture](docs/architecture.md) · [Risques](docs/risks/book-impact-gardien.md)

**Mode Match (extension)**
- [Brief](docs/brief-mode-match.md) · [PRD](docs/prd-mode-match.md)
- [Design](docs/design/mode-match.md) · [Visuel](docs/visual/mode-match.md)
- [Architecture](docs/arch/mode-match.md) · [Risques](docs/risks/mode-match.md)

**Recentrage Match (extension)**
- [Brief](docs/brief-recentrage-match.md) · [PRD](docs/prd-recentrage-match.md)
- [Design](docs/design/recentrage-match.md) · [Visuel](docs/visual/recentrage-match.md)
- [Architecture](docs/arch/recentrage-match.md) · [Risques](docs/risks/recentrage-match.md)

**Suivi**
- [Stories](docs/stories/) · [QA](docs/qa/) · [E2E](docs/e2e/) · [Code review](docs/code-review/) · [Sécurité](docs/security/) · [Régression](docs/regression/)

## Stack
HTML/CSS/JS vanilla (pas de build), Supabase (Postgres + API), déployé sur GitHub Pages.

## Composants réutilisés
Les zones de tir (terrain, 11 zones) et de cage (9 zones) sont reprises telles quelles depuis [CF Fenix Stat](fenix-terrain-zones-export/README.md) — même géométrie, même identité visuelle.

## État
✅ MVP Book Impact Gardien + extensions Mode Match et Recentrage Match livrés — 22 stories validées à tous les stades (code review, QA, E2E, sécurité, régression). Voir [docs/stories/](docs/stories/) pour le détail par story et [CLAUDE.md](CLAUDE.md) pour l'état d'avancement fonctionnel complet.
