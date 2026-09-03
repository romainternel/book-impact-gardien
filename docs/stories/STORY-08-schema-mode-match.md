# STORY-08 — Extension du schéma Supabase pour le mode Match

**En tant que** développeur qui va implémenter les écrans du mode Match,
**Je veux** les tables et colonnes nécessaires en base avec leurs contraintes et policies RLS,
**Afin de** pouvoir construire les écrans Équipes/Joueurs/Matchs/Saisie Match sur un schéma déjà correct.

## Contexte technique
- Zone concernée : instance Supabase existante (extension, pas de nouveau projet).
- Exécuter le DDL complet de `docs/arch/mode-match.md` §3 : table `equipes`, `tireurs.equipe_id` (+ extension du CHECK `poste` avec `gardien_but`), table `matchs` (+ contrainte `equipes_distinctes`, `journee` par regex J01-J22), `impacts.match_id`, extension des contraintes `impacts_resultat_check` (+ `non_but`) et `zone_cage_coherente` (`non_but` traité comme `hors_cadre`).
- Policies RLS least-privilege dès la création (pas de `for all` générique) : `select`/`insert` uniquement sur `equipes` et `matchs`, cohérent avec `docs/risks/mode-match.md` #3 (dette assumée, pas d'`update`/`delete`).
- **Après création de `matchs`**, noter le nom réel des contraintes FK générées (`matchs_equipe_a_id_fkey`, `matchs_equipe_b_id_fkey` ou équivalent) — nécessaire pour STORY-12 (cf. `docs/risks/mode-match.md` #6).

## Critères d'acceptation
- [ ] `equipes`, `matchs` existent avec exactement les colonnes/contraintes de `docs/arch/mode-match.md` §3.
- [ ] `tireurs.equipe_id` accepte `null` (tireurs libres existants/futurs non affectés) et une référence valide vers `equipes.id`.
- [ ] `tireurs.poste` accepte désormais `gardien_but` en plus des 6 valeurs existantes.
- [ ] Un insert dans `matchs` avec `equipe_a_id = equipe_b_id` est rejeté (contrainte `equipes_distinctes`).
- [ ] Un insert dans `matchs` avec `journee` hors du format `J01`-`J22` est rejeté.
- [ ] Un insert dans `impacts` avec `resultat = 'non_but'` et `zone_cage` renseignée est rejeté (même règle que `hors_cadre`).
- [ ] Un insert dans `impacts` avec `resultat = 'non_but'` et `zone_cage` null est accepté.
- [ ] Policies RLS vérifiées opération par opération contre des lignes réelles (pas des ids inventés), même méthodologie que `docs/security/story-02-supabase-rls.md` : `select`/`insert` autorisés, `update`/`delete` bloqués sur `equipes` et `matchs`.
- [ ] Le schéma existant (`gardiens`, `tireurs` hors nouvelle colonne, `impacts` hors nouvelle colonne/valeurs) n'est pas cassé — un insert `tireur` ou `impact` "à l'ancienne" (sans `equipe_id`/`match_id`) fonctionne toujours.

## Hors scope
- Toute UI consommant ce schéma (stories suivantes).
- Table de référence des journées (hors scope, cf. critère de bascule architecture §8).

## Dépend de
Aucune

## Taille
M
