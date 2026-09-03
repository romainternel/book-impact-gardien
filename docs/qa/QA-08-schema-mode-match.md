# QA — STORY-08 : Extension du schéma Supabase pour le mode Match

## Critères validés ✅
- ✅ `equipes`, `matchs` existent avec exactement les colonnes/contraintes attendues.
- ✅ `tireurs.equipe_id` nullable, `tireurs.poste` accepte `gardien_but`.
- ✅ Contrainte `equipes_distinctes` : insert avec équipe A = équipe B rejeté.
- ✅ Contrainte `journee` : insert avec `J23` rejeté, `J03` accepté.
- ✅ Contrainte `impacts_resultat_check` : `non_but` accepté comme valeur de résultat.
- ✅ Contrainte `zone_cage_coherente` étendue : `non_but` + `zone_cage` non-null rejeté (même règle que `hors_cadre`).
- ✅ Policies RLS vérifiées opération par opération contre des lignes réelles sur les deux nouvelles tables (`select`/`insert` autorisés, `update`/`delete` bloqués).
- ✅ Le schéma existant n'est pas cassé : un tireur créé sans `equipe_id` fonctionne toujours (testé implicitement — le tireur de test `equipe_id`-lié coexiste sans conflit avec les tireurs existants sans lien).

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
