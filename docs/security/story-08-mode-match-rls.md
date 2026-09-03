# Security Audit — STORY-08 : RLS `equipes` et `matchs`

## Périmètre
2 nouvelles tables : `equipes`, `matchs`. Même modèle de sécurité que l'existant (pas d'authentification, sécurité entièrement portée par RLS — cf. `docs/security/story-02-supabase-rls.md` pour le contexte général déjà accepté).

## Vérification policy par policy (contre des lignes réelles, pas des ids inventés)

| Table | Opération | Attendu | Vérifié |
|---|---|---|---|
| `equipes` | select | Autorisé | ✅ |
| `equipes` | insert | Autorisé | ✅ |
| `equipes` | update | **Interdit** | ✅ tentative sur ligne réelle → 0 rows affected, nom inchangé après relecture |
| `equipes` | delete | **Interdit** | ✅ tentative sur ligne réelle → 0 rows affected, ligne toujours présente après relecture |
| `matchs` | select | Autorisé | ✅ |
| `matchs` | insert | Autorisé | ✅, y compris rejet correct des deux contraintes (`equipes_distinctes`, format `journee`) |
| `matchs` | update | **Interdit** | ✅ tentative sur ligne réelle → 0 rows affected, `saison` inchangée après relecture |
| `matchs` | delete | **Interdit** | ✅ tentative sur ligne réelle → 0 rows affected, ligne toujours présente après relecture |

## Fuite via le front / clés et secrets
Rien de nouveau — aucune modification de `config.js`, aucune clé privilégiée introduite. Les deux nouvelles tables sont exposées via la même clé publishable déjà auditée.

## Contrainte croisée avec l'existant
`tireurs.equipe_id` référence `equipes.id` — puisque `equipes` n'autorise pas `delete`, aucun risque d'orphelin (`tireur.equipe_id` pointant vers une équipe supprimée) ne peut se produire au niveau applicatif. Cohérence garantie par construction, pas seulement par convention.

## Findings
Aucun finding Critique. Aucun finding Majeur.

**Mineur** (déjà noté par le Risk Analyst, #3) : l'absence d'`update`/`delete` sur `equipes`/`matchs` signifie qu'une erreur de saisie (faute de frappe dans un nom d'équipe) ne peut être corrigée que par SQL direct. Dette assumée, cohérente avec le choix déjà fait sur `gardiens`/`tireurs`.

## Verdict
**Aucun blocage.**
