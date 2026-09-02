# E2E — STORY-04 : Écran Sélection / création tireur

## Parcours testés
1. Local (`localhost:8099`) : sélection gardien → écran tireur, recherche sans résultat → création (nom + club + latéralité), recherche exacte après création (ligne "+ Créer" disparaît), sélection directe, bouton retour, état erreur simulé.
2. Live (`https://romainternel.github.io/book-impact-gardien/`, navigation cache-bustée) : rendu et fonctionnement de l'écran tireur.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Recherche → création → re-recherche exacte (local) | ✅ | Nom, club, latéralité correctement enregistrés ; `hasExactMatch` masque bien "+ Créer" une fois le tireur créé |
| Sélection directe (local) | ✅ | `state.tireurCourant` correctement peuplé |
| Retour header (local) | ✅ | Ramène à l'écran gardien |
| État erreur simulé (local) | ✅ | Message + Réessayer affichés |
| Rendu live | ✅ (après contournement du cache CSS, voir note) | Identique au rendu local |

## Écart avec le verdict QA — non fonctionnel, méthodologique (suite de E2E-03)
Même famille de problème que STORY-03 : la première capture live montrait un rendu visuellement cassé (input non stylé, header mal aligné) alors que **le code déployé était déjà confirmé correct** par diff cache-busté de chaque fichier changé (`index.html`, `css/app.css`, `js/main.js`, `js/screens/header.js`, `js/screens/screen-gardien.js`, `js/screens/screen-tireur.js` — tous identiques au local). La cause : `css/app.css` était servi depuis le cache navigateur de cette session de test (périmé, antérieur à STORY-04), indépendamment du cache-bust sur l'URL du document HTML — un cache-bust sur le document ne force pas le re-fetch de ses sous-ressources si elles sont déjà en cache sous leur propre URL. Un rechargement ciblé de la feuille de style (`?cb=timestamp` sur son URL propre) a confirmé le rendu correct. **Pas un bug produit.**

## Verdict
**CONFIRMÉ**

## Recommandation pour les prochaines passes E2E de ce projet
Si plusieurs stories sont vérifiées en direct dans la même fenêtre de 10 minutes (cache GitHub Pages), cache-buster individuellement CHAQUE ressource statique modifiée (pas seulement l'URL du document HTML), ou espacer les vérifications live de plus de 10 minutes.
