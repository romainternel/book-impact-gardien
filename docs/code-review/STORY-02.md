# Code Review — STORY-02 : Schéma Supabase et client API

## Conformité Architecture
- Schéma exécuté strictement conforme à `docs/architecture.md` §3 (`zone_cage text`, contrainte `zone_cage_coherente`, index sur `impacts`). ✅
- Policies RLS remplacées par les policies least-privilege du Risk Analyst dès la création, pas de `for all` générique à aucun moment — vérifié en lisant le script exécuté, pas seulement supposé. ✅
- `api.js` expose exactement les fonctions listées dans `docs/architecture.md` §4, toutes `async`, toutes propagent l'erreur (`throw`) plutôt que de l'avaler. ✅

## Réutilisation vs duplication
- Une seule instance de client (`supabaseClient` dans `supabase-client.js`), toutes les fonctions `api.js` la réutilisent — pas de `createClient()` dupliqué ailleurs.

## Scope
- Fichiers touchés : `js/config.js`, `js/supabase-client.js`, `js/api.js`, `index.html` (ajout des 4 balises script). Rien hors périmètre.

## Lisibilité et maintenabilité
- Chaque fonction `api.js` est courte, un seul appel Supabase, pattern homogène (`if(error) throw error; return data;`) — facile à scanner pour un autre agent.
- `getTireursRecents` est la fonction la plus complexe (dérivation client-side depuis `impacts`, pas de table dédiée) — commentée avec un renvoi explicite vers `docs/architecture.md` §4 pour le contexte de cette décision.

## Gestion d'erreurs
- Aucune fonction n'utilise de `try/catch` qui masquerait une erreur — conforme au critère d'acceptation explicite de la story. Vérifié en conditions réelles : un insert avec `zone_tir` invalide lève bien une exception côté appelant (testé en navigateur, pas en théorie).

## Sécurité basique (signalement au Security Auditor)
- Clé présente en dur dans `config.js` : c'est la clé **publishable** (équivalent `anon`), pas une clé secrète — usage attendu et documenté côté Supabase pour du code client. Pas de `service_role` ni de secret nulle part dans le code. Le Security Auditor doit néanmoins auditer les policies RLS en détail (c'est son rôle, pas le mien) — je lui signale le point pour vérification indépendante.
- `searchTireurs` interpole la saisie utilisateur dans un filtre PostgREST textuel (`.or()`) — j'ai vérifié que le Developer a ajouté une validation à la frontière (suppression de `,()`  avant interpolation) pour éviter qu'une saisie contenant ces caractères ne casse la grammaire de filtre. Pas un risque d'injection SQL (PostgREST paramètre la valeur elle-même), juste une robustesse fonctionnelle — correctement traité.

## Taille et complexité
- Story M conforme à l'estimation. Pas de sur-ingénierie (pas de couche d'abstraction ORM, pas de retry logic non demandée).

## Verdict
**APPROUVÉ**
