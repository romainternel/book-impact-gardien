# QA — STORY-02 : Schéma Supabase et client API

## Critères validés ✅
- ✅ Les 3 tables existent avec exactement les colonnes/types/contraintes de `docs/architecture.md` §3 (`zone_cage` en `text`).
- ✅ Insert `impacts` avec `resultat != 'hors_cadre'` et `zone_cage` null → rejeté (`23514`, contrainte `zone_cage_coherente`).
- ✅ Insert `impacts` avec `resultat = 'hors_cadre'` et `zone_cage` non null → également rejeté, même contrainte.
- ✅ Policies RLS least-privilege confirmées opération par opération (détail dans `docs/security/story-02-supabase-rls.md`) — pas de `for all` générique.
- ✅ Chaque fonction `api.js` propage l'erreur Supabase (vérifié : un insert invalide déclenche bien une exception côté appelant, capturée par un `try/catch` de test).
- ✅ `getTireursRecents` retourne les tireurs distincts triés par récence pour le gardien donné, sans table de tracking séparée — vérifié avec des données réelles (impact créé → apparaît en tête ; aucun impact → liste vide, pas d'erreur).

## Cas limites testés
- Gardien sans aucun impact enregistré : `getTireursRecents` retourne `[]` sans erreur. ✅
- Recherche tireur avec des caractères spéciaux (`,` `(` `)`) : ne casse pas la requête (validation à la frontière confirmée en lisant le code, cohérente avec le reste du comportement testé). 
- Suppression d'un impact puis relecture immédiate : la donnée n'apparaît plus, pas de latence de cohérence observée.

## Régression
- `js/vendor/*` et `css/zones.css` toujours identiques à l'export (diff vide re-vérifié après cette story).
- Écran placeholder (STORY-01) toujours fonctionnel, chargement des 4 nouveaux scripts (CDN + config + client + api) sans erreur console additionnelle au-delà du 404 favicon connu.

## Performance
Sans objet à ce stade (aucun volume de données réel, table quasi vide).

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
