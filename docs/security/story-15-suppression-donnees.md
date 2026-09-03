# Security Audit — STORY-15 : Suppression de données depuis l'app

## Périmètre
4 nouvelles policies RLS `delete` (`gardiens`, `tireurs`, `equipes`, `matchs`), s'ajoutant aux policies `select`/`insert`(/`update` pour `tireurs`) déjà en place. `impacts` avait déjà sa policy `delete` depuis STORY-02 (réutilisée pour "Annuler dernier impact").

## Vérification policy par policy (contre des lignes réelles)

| Table | Opération | Attendu | Vérifié |
|---|---|---|---|
| `gardiens` | delete | Autorisé | ✅ Ligne réelle supprimée, absence confirmée par relecture |
| `equipes` | delete | Autorisé **si non référencée** | ✅ Bloqué par FK tant qu'un joueur existe (erreur `23503` interceptée, message clair, ligne toujours présente) ; supprimée avec succès une fois le joueur retiré |
| `tireurs` | delete | Autorisé | ✅ Joueur d'équipe supprimé avec succès (aucun impact ne le référençait) |
| `matchs` | delete | Autorisé | ✅ Ligne réelle supprimée, absence confirmée |

## Fuite via le front / clés et secrets
Rien de nouveau — aucune modification de `config.js`.

## Analyse du changement de surface d'exposition
Avant cette story, ces 4 tables étaient déjà lisibles/créables par n'importe qui connaissant l'URL publique (dette déjà assumée et documentée depuis STORY-02/STORY-08). Cette story ajoute la **suppression** — c'est un changement réel de surface, mais :
- La protection FK `RESTRICT` (déjà en place, pas ajoutée par cette story) empêche la perte silencieuse de données historiques : impossible de supprimer un gardien/tireur/match qui a des impacts, ou une équipe qui a des joueurs/matchs, sans d'abord supprimer ces dépendances une par une.
- Le risque réel n'est donc pas la perte de données de scouting (protégée par les FK), mais la suppression d'entités **sans dépendance** (ex. une équipe vide, un gardien sans historique) par une personne non autorisée ayant trouvé l'URL — cohérent avec la dette déjà assumée sur `select`/`insert`/`update`, pas une nouvelle catégorie de risque.

## Traçabilité
Toujours aucune (pas d'identité utilisateur réelle) — inchangé depuis les audits précédents, cohérent.

## Findings
Aucun finding Critique. Aucun finding Majeur.

**Mineur** : la protection contre la perte de données repose entièrement sur les contraintes FK `RESTRICT` déjà en place — si une future story change ces contraintes en `CASCADE` (par exemple pour simplifier une suppression en masse), elle **supprimerait aussi cette protection implicite** sans que ce soit forcément visible dans la review de cette future story si elle ne relit pas cet audit. À signaler explicitement dans `docs/arch/mode-match.md` ou un futur document d'architecture si une story touche un jour aux contraintes `ON DELETE`.

## Verdict
**Aucun blocage.**
