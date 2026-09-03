# Code Review — STORY-08 : Extension du schéma Supabase pour le mode Match

## Conformité Architecture
- Schéma exécuté strictement conforme à `docs/arch/mode-match.md` §3 : `equipes`, `tireurs.equipe_id` (nullable), `poste` étendu avec `gardien_but`, `matchs` (+ `equipes_distinctes`, `journee` regex), `impacts.match_id` (nullable), `resultat` étendu avec `non_but`, `zone_cage_coherente` étendue. ✅
- Policies RLS least-privilege dès la création (`select`/`insert` uniquement sur `equipes`/`matchs`, pas de `for all`) — cohérent avec le précédent déjà établi sur `gardiens`/`tireurs`. ✅
- Noms réels des contraintes FK de `matchs` récupérés et documentés (`matchs_equipe_a_id_fkey`, `matchs_equipe_b_id_fkey`) — exactement ceux anticipés par l'Architect, prêts pour STORY-12. ✅

## Réutilisation vs duplication
- Migration robuste : les anciennes contraintes `poste`/`resultat` ont été supprimées via recherche dynamique du nom réel (`pg_constraint`) plutôt que supposées — évite un échec de migration si le nom auto-généré avait différé de l'hypothèse de l'Architect.

## Scope
- Migration SQL uniquement. Aucun fichier JS/CSS touché à ce stade (conforme — "Hors scope : Toute UI consommant ce schéma").

## Sécurité basique
Signalement au Security Auditor : deux nouvelles tables (`equipes`, `matchs`) exposées via l'API publique. RLS déjà posée en least-privilege dès la création, mais audit indépendant requis (nouvelle ressource backend) avant de considérer cette story clôturée.

## Point vérifié en conditions réelles
- `equipes`/`matchs` accessibles en lecture/écriture (`select`/`insert`), `delete` bloqué (vérifié contre une ligne réelle, pas un id inventé — même méthodologie que STORY-02).
- Contrainte `equipes_distinctes` : rejet confirmé (`23514`).
- Contrainte `journee` (regex J01-J22) : rejet confirmé sur `J23`.
- Contrainte `poste` étendue : `gardien_but` accepté, une valeur arbitraire (`capitaine`) rejetée — confirme que l'ancienne contrainte a bien été remplacée, pas simplement complétée en doublon.
- Contrainte `zone_cage_coherente` étendue : `non_but` + `zone_cage` non-null rejeté, cohérent avec `hors_cadre`.

## Verdict
**APPROUVÉ**
