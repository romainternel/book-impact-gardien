# E2E — STORY-17 : Simplification du flow "Book par tireur"

## Environnement de test
Serveur statique local (`http-server`) pointant sur le même backend Supabase de production (`js/config.js` inchangé) — méthodologie déjà en vigueur depuis STORY-10 (cf. `docs/e2e/E2E-16-edition-tireur-joueur.md`).

## Parcours testés (Playwright, navigateur réel)

1. Sélection gardien "Gabin" → Accueil → "Book par tireur" → liste chargée (tireurs "50", "11").
2. **Sélection d'un tireur existant avec impact historique réel** ("11", qui possède en base un impact `resultat = "arret"`, identifié en amont par requête REST directe) → tap sur la ligne → **atterrissage direct sur l'écran Book** (titre "11 — Ailier D · Gaucher", stats, heatmaps, historique) — pas de passage par l'ancien écran de saisie.
3. **Vérification du risque P0 (Risk Analyst)** : l'historique affiche bien le badge **"Arrêt"** pour l'impact `resultat = "arret"` — `resultatLabel()` relocalisé dans `screen-book.js` fonctionne correctement en conditions réelles, aucune erreur console (`resultatLabel is not defined` absente).
4. Tap sur le lien "←" du header du Book → retour sur l'écran Tireur (recherche/liste), pas d'écran "introuvable".
5. Recherche "TestE2E17" (inexistant) → "+ Créer" → formulaire → "Créer et commencer" → **atterrissage direct sur le Book vide** ("Aucun tir enregistré pour ce tireur").
6. Tap sur le bouton "Retour" (nouveau libellé, remplace "Retour à la saisie") de l'état vide → retour sur l'écran Tireur.
7. Nettoyage : suppression du tireur de test "TestE2E17" créé pour le parcours 5, confirmée (dialogue natif accepté, ligne disparue de la recherche) — aucune donnée réelle de production laissée par les tests.
8. Console navigateur surveillée sur l'ensemble de la session : **0 erreur JS** (seule entrée : un 404 `favicon.ico`, sans rapport avec la story).

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Sélection tireur existant → Book direct | ✅ | Plus de passage par l'ancien écran de saisie |
| Badge "Arrêt" sur impact historique (risque P0) | ✅ | Vérifié avec une vraie ligne de production, aucune erreur console |
| Retour header Book → écran Tireur | ✅ | |
| Création tireur → Book vide direct | ✅ | |
| Bouton "Retour" (état vide) → écran Tireur | ✅ | Nouveau libellé conforme à la story |
| Recherche/sélection/suppression tireur (non-régression) | ✅ | Utilisées comme mécanisme de test, aucun comportement altéré |
| Absence d'erreur console sur l'ensemble du parcours | ✅ | 0 erreur JS |

## Écarts avec le verdict QA
Aucun. Tous les parcours confirment le verdict `PASSED` du QA, y compris la vérification en conditions réelles du risque P0 que le QA n'avait validé que par requête API + traçage de code.

## Verdict
**CONFIRMÉ**
