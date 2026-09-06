# Code Review — Corrections Audit Final 2026-09-05

Correctifs ciblés pour les deux bugs remontés par l'Auditeur Final (`docs/audit-final/AUDIT-2026-09-05.md`) — pas une story formelle, traité comme une correction directe conformément à la recommandation de l'agent ("Mes bugs trouvés peuvent être repris par le Developer comme des corrections ciblées").

## Correctif 1 — Cul-de-sac "Joueurs" (Bloquant)
`screen-joueurs.js` : l'état vide "Aucune équipe sélectionnée" a désormais un header avec bouton retour (`{ back: "equipes" }`), au lieu d'un `<div class="screen-placeholder">` nu. `bindAppHeader()` déplacé avant le retour anticipé de `onMountScreenJoueurs()` pour que ce lien soit effectivement câblé dans les deux cas (état vide et état normal) — sans ce déplacement, le lien se serait affiché sans jamais être fonctionnel (bug silencieux classique : header rendu mais jamais bindé).

Diff minimal, aucune modification de la logique CRUD existante (recherche, création, édition, suppression intactes).

## Correctif 2 — Gardien fantôme non détecté (Gênant)
`main.js` : le gardien mémorisé en `localStorage` est désormais vérifié contre `getGardiens()` (fonction déjà existante, aucune nouvelle requête introduite) avant d'être considéré valide. S'il n'existe plus, `clearGardienFromStorage()` (déjà existante) nettoie l'état et l'utilisateur retombe sur l'écran de sélection. En cas d'échec réseau de la vérification elle-même, repli silencieux sur l'écran de sélection plutôt qu'un état spécial — cohérent avec le principe déjà établi ailleurs dans l'app (chaque écran gère son propre état d'erreur/retry, ici `screen-gardien.js` s'en charge).

Bonus : réutilise `registerScreen("placeholder", ...)`, déclaré mais jamais appelé jusqu'ici (code mort réactivé avec un usage réel — évite un flash d'écran vide pendant la vérification réseau).

## Conformité
- Aucune nouvelle fonction API créée — réutilisation stricte de `getGardiens()`, `clearGardienFromStorage()`, `renderAppHeader()`, `bindAppHeader()`.
- Scope strictement limité aux deux fichiers concernés par les bugs trouvés.
- Commentaires de tête mis à jour sur les deux fichiers, référençant explicitement l'audit (cohérent avec la convention du projet : expliquer le "pourquoi", pas le "quoi").

## Vérifié en direct par le Developer (Playwright, serveur local)
- Gardien fantôme injecté en `localStorage` → détecté, nettoyé, repli correct sur l'écran de sélection (le vrai gardien "Gabin" s'affiche, pas le fantôme).
- Accès direct à "Joueurs" depuis Paramètres sans équipe sélectionnée → header + lien retour présents et fonctionnels (mène bien à "Équipes").
- Non-régression : flux normal Équipes → tap équipe → Joueurs toujours identique (recherche, ✏️, 🗑 tous présents).
- 0 erreur console.

## Verdict
**APPROUVÉ**
