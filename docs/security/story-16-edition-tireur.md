# Security Audit — STORY-16 : Édition d'un tireur/joueur existant

## Périmètre
Aucune nouvelle policy RLS. La policy `update` sur `tireurs` (`anon update tireurs ... using (true) with check (true)`) existe depuis STORY-02 — cette story ne fait qu'exercer côté frontend une permission déjà accordée en base et jamais utilisée jusqu'ici.

## Vérification (contre une ligne réelle)
| Table | Opération | Attendu | Vérifié |
|---|---|---|---|
| `tireurs` | update | Autorisé (nom/club/poste/latéralité) | ✅ Deux lignes réelles de production modifiées puis restaurées via l'UI (tireur libre "64", joueur "20" de l'équipe BILLERE), changement confirmé par relecture directe de l'API REST à chaque étape |

## Analyse du changement de surface d'exposition
Pas de changement réel de surface : `tireurs` était déjà éditable par n'importe qui connaissant l'URL publique depuis STORY-02 (dette déjà assumée et documentée), simplement inexploité côté UI jusqu'à présent. Cette story ne fait qu'exposer dans l'interface une capacité déjà présente en base — cohérent avec la dette déjà assumée sur `select`/`insert`/`delete`, pas une nouvelle catégorie de risque.

`equipe_id` n'est jamais dans le payload envoyé par ce formulaire (vérifié dans `updateTireur()` et `readTireurFormFields()`) : impossible de détourner ce formulaire pour transférer un joueur d'une équipe à une autre, même en manipulant le DOM côté client, puisque le serveur ne reçoit jamais ce champ depuis ce point d'entrée.

## Traçabilité
Toujours aucune (pas d'identité utilisateur réelle) — inchangé depuis les audits précédents.

## Findings
Aucun finding Critique. Aucun finding Majeur. Aucun finding Mineur nouveau (le mineur déjà documenté en STORY-15 sur la dépendance aux contraintes FK `RESTRICT` reste valable et n'est pas affecté par cette story).

## Verdict
**Aucun blocage.**
