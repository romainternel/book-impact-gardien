# Book Impact Gardien

Web app pour gardiens de but de handball : enregistrer en 2-3 taps, pendant le visionnage d'une vidéo de match, l'impact de chaque tir adverse subi (zone de tir, zone de cage, résultat, contexte), et consulter ensuite un "book" par tireur adverse avant un futur match.

## Documentation
- [Cahier des charges initial](book-impact-gardien-brief.md)
- [Brief](docs/brief.md) · [PRD](docs/prd.md)
- [Design](docs/design/book-impact-gardien.md) · [Visuel](docs/visual/book-impact-gardien.md)
- [Architecture](docs/architecture.md) · [Risques](docs/risks/book-impact-gardien.md)
- [Stories](docs/stories/)

## Stack
HTML/CSS/JS vanilla (pas de build), Supabase (Postgres + API), déployé sur GitHub Pages.

## Composants réutilisés
Les zones de tir (terrain, 11 zones) et de cage (9 zones) sont reprises telles quelles depuis [CF Fenix Stat](fenix-terrain-zones-export/README.md) — même géométrie, même identité visuelle.

## État
🚧 En cours de développement — voir [docs/stories/](docs/stories/) pour l'avancement story par story.
