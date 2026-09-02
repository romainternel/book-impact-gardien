# E2E — STORY-03 : Écran Sélection gardien

## Parcours testés
1. Chargement local (`http://localhost:8099`) : liste, création inline, sélection, persistance après reload, lien "Changer de gardien", états vide/erreur simulés.
2. Chargement live (`https://romainternel.github.io/book-impact-gardien/`, navigation fraîche, cache-bustée).

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Liste + sélection (local) | ✅ | Tap sur une carte → `localStorage` rempli, navigation vers l'écran suivant |
| Création inline (local) | ✅ | Nouveau gardien créé, sélectionné automatiquement, apparaît ensuite dans la liste |
| Persistance après reload (local) | ✅ | Rechargement de page → écran gardien sauté, arrivée directe sur l'écran suivant |
| Lien "Changer de gardien" (local) | ✅ | Efface le storage, réaffiche la liste, le lien lui-même disparaît une fois `gardienId` retombé à `null` |
| État vide / erreur (local, simulés) | ✅ | Rendu conforme à la maquette dans les deux cas |
| Chargement live (fraîche, cache-bustée) | ✅ | Liste des 2 gardiens réels affichée, identique au rendu local |

## Écart avec le verdict QA — non fonctionnel, méthodologique
Rien à corriger côté produit, mais un point mérite d'être documenté : **GitHub Pages sert les assets avec `Cache-Control: max-age=600`**. En testant plusieurs stories consécutives sur la même URL dans la même fenêtre de 10 minutes, ce navigateur de test a servi une version **périmée** de `index.html` (et donc de `js/main.js`, absent de `Screens.gardien`) lors d'une première navigation simple. Un `fetch(url, {cache:"no-store"})` a confirmé que le contenu réellement déployé était correct à chaque étape ; une navigation avec un paramètre de cache-bust (`?cb=...`) sur l'URL a ensuite donné un rendu live conforme au premier essai propre. **Pas un bug produit** — un vrai visiteur (premier passage, ou après expiration du cache) obtient directement la bonne version. À garder en tête pour les prochaines passes E2E de ce projet : cache-buster l'URL live si plusieurs stories sont vérifiées coup sur coup.

## Verdict
**CONFIRMÉ**
