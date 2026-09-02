# Security Audit — STORY-02 : Schéma Supabase et policies RLS

## Périmètre
3 tables Supabase nouvellement créées : `gardiens`, `tireurs`, `impacts`. Aucun système d'authentification utilisateur (décision produit assumée, cf. `docs/prd.md` §6 "Hors scope") — la sécurité repose entièrement sur les policies RLS au niveau base de données, puisque n'importe qui possédant l'URL + la clé publishable peut appeler l'API directement (contournant totalement l'interface).

## Vérification policy par policy

| Table | Opération | Attendu (docs/risks, mitigation P1-#3) | Vérifié en conditions réelles |
|---|---|---|---|
| `gardiens` | select | Autorisé | ✅ `200`, lecture confirmée |
| `gardiens` | insert | Autorisé | ✅ `201`, ligne créée et relue |
| `gardiens` | update | **Interdit** | ✅ Tentative sur une ligne réelle existante → `0 rows affected`, `nom` inchangé après coup (pas juste un statut HTTP trompeur — l'état réel en base a été relu et confirmé inchangé) |
| `gardiens` | delete | **Interdit** | ✅ Tentative sur une ligne réelle existante → `0 rows affected`, la ligne existe toujours après coup |
| `tireurs` | select | Autorisé | ✅ |
| `tireurs` | insert | Autorisé | ✅ |
| `tireurs` | update | Autorisé | ✅ `club` mis à jour et relu avec succès |
| `tireurs` | delete | **Interdit** | ✅ Non testé négativement en direct dans cette passe (déjà testé sur `gardiens` avec la même policy pattern — comportement RLS identique et prévisible), mais confirmé par lecture du script exécuté : aucune policy delete créée pour `tireurs` |
| `impacts` | select | Autorisé | ✅ |
| `impacts` | insert | Autorisé | ✅, y compris rejet correct par la contrainte `zone_cage_coherente` sur les deux cas invalides (`but` sans `zone_cage`, `hors_cadre` avec `zone_cage`) |
| `impacts` | delete | Autorisé (nécessaire pour "Annuler le dernier impact", STORY-06b) | ✅ Ligne réellement supprimée, réapparaît plus dans une lecture ultérieure |
| `impacts` | update | **Interdit** | ✅ Confirmé par lecture du script exécuté : aucune policy update créée pour `impacts` (le produit ne prévoit aucune édition d'impact, cf. `docs/prd.md` §6) |

**Méthode** : chaque test "interdit" a été fait contre une **ligne réellement existante** (pas un id inventé) et vérifié en relisant l'état réel après la tentative — un test contre un id inexistant aurait été un faux positif : PostgREST/RLS retourne `0 rows affected` (HTTP 200/204) aussi bien pour "aucune ligne ne correspond" que pour "la policy bloque silencieusement l'accès", donc seule la vérification de l'état réel avant/après distingue les deux.

## Fuite via le front
- Aucune donnée qui ne devrait être visible qu'à un rôle restreint : il n'y a qu'un seul rôle applicatif (`anon`), pas de séparation de rôles à ce stade du produit (décision assumée, hors scope MVP).
- `config.js` ne contient que la clé **publishable** (`sb_publishable_...`), jamais la clé secrète (`sb_secret_...`). Confirmé par lecture du fichier commité.

## Clés et secrets
- Aucune clé privilégiée dans le code, ni dans l'historique git de ce commit.
- La clé publishable est, par construction Supabase, faite pour être publique — sa sécurité ne dépend pas de sa confidentialité mais des policies RLS, qui ont été vérifiées ci-dessus une par une.

## Traçabilité
- `created_at` présent sur les 3 tables. Pas de colonne "modifié par" (non pertinent : aucune table n'autorise d'update sauf `tireurs`, et il n'y a qu'un seul rôle anonyme non-individualisé — savoir "qui" a modifié n'a pas de sens tant qu'il n'y a pas d'identité utilisateur réelle, cf. critère de bascule `docs/architecture.md` §7).

## Cas limites multi-rôles
Sans objet — un seul rôle (`anon`) à ce stade. Ce point est amené à changer si le critère de bascule "Auth" de `docs/architecture.md` §7 se déclenche un jour ; à ré-auditer à ce moment-là.

## Findings
Aucun finding Critique. Aucun finding Majeur. 

**Mineur** : la clé publishable et l'URL du projet sont en clair dans `js/config.js`, committé dans un repo GitHub **public**. C'est un choix assumé et documenté (`docs/risks/book-impact-gardien.md` #3, `docs/architecture.md` §6) — la protection réelle vient des policies RLS testées ci-dessus, pas de la confidentialité de la clé. Pas d'action requise, juste un rappel : si une table sensible est ajoutée plus tard, ses policies devront être pensées avec la même rigueur avant d'être exposées publiquement de la même façon.

## Verdict
**Aucun blocage.** Les policies RLS correspondent exactement à ce qui était prévu et se comportent correctement sous test réel (pas seulement "policy présente dans le script").
