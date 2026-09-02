# E2E — STORY-06a : Écran Saisie impact, boucle cœur

## Parcours testés
1. Local : flow `hors_cadre` (2 taps), flow `but` (3 taps), verrouillage/déverrouillage cage, changement de résultat après sélection de cage, préremplissage `type_tir`/`main` au montage, lien Book (fallback attendu).
2. Live (`https://romainternel.github.io/book-impact-gardien/`) : rendu de l'écran + un enregistrement `hors_cadre` complet contre la vraie base Supabase, vérifié par lecture directe puis nettoyé.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| `hors_cadre` en 2 taps (local + live) | ✅ | `zone_cage: null` en base, écran réinitialisé |
| `but` en 3 taps (local) | ✅ | `zone_tir`, `zone_cage`, `type_tir`, `main` tous corrects en base |
| Verrouillage visuel de la cage (local) | ✅ | `pointer-events:none` effectif tant qu'aucun résultat cadré n'est choisi |
| Changement vers `hors_cadre` après sélection de cage (local) | ✅ | `zoneCage` repasse à `null`, aucun enregistrement prématuré |
| Préremplissage `type_tir`/`main` (local) | ✅ | Restaure la dernière valeur utilisée pour ce tireur à la réouverture de l'écran |
| Lien Book (local + live) | ✅ | Fallback routeur "introuvable" affiché comme attendu (cible STORY-07a pas encore livrée) |

## Écart avec le verdict QA — méthodologique, même famille que STORY-03/04
Nouvelle occurrence du même phénomène de cache GitHub Pages, cette fois sur un fichier différent (`js/screens/screen-tireur.js`) que je n'avais pas rechargé lors de ma première tentative (j'avais rechargé `css/app.css` en pensant que c'était suffisant). Diff cache-busté de tous les fichiers modifiés confirmé identique au déploiement **avant** même de toucher au navigateur ; le rendu live cassé initial était bien uniquement dû au cache de CE navigateur de test sur un fichier JS distinct. Un rechargement forcé de tous les scripts d'écran modifiés (`fetch(..., {cache:"no-store"})` + `eval`) a permis de confirmer le rendu et le comportement corrects.

## Verdict
**CONFIRMÉ**

## Recommandation renforcée
Pour ce projet, la vérification live fiable dans une même session de test rapprochée doit systématiquement inclure : diff cache-busté de **tous** les fichiers changés (pas seulement l'un d'eux) avant de conclure à un bug produit sur la base d'un rendu visuel live.
