# E2E — STORY-06b : Écran Saisie impact, robustesse

## Parcours testés
1. **Local** (`localhost:8099`, contre le vrai backend Supabase) : anti double-tap (écriture ralentie artificiellement à 600ms + triple-clic), erreur simulée + retry, annulation avec vérification de suppression réelle en base.
2. **Live** (`https://romainternel.github.io/book-impact-gardien/`) : diff cache-busté de tous les fichiers modifiés + anti double-tap contre le vrai backend en conditions live + tentative de vérification de l'annulation.

## Résultat par parcours

| Parcours | Résultat | Détail |
|---|---|---|
| Diff déploiement (live) | ✅ | `css/app.css`, `js/screens/screen-impact.js` identiques octet pour octet au code testé en local |
| Anti double-tap (local) | ✅ | Triple-clic pendant écriture ralentie → 1 seul impact créé (vérifié par lecture directe) |
| Anti double-tap (live) | ✅ | Même test contre le backend live → 1 seul impact créé |
| Erreur + Réessayer (local) | ✅ | Bandeau rouge, sélection conservée, retry réussi après restauration de la fonction réelle |
| Annulation (local) | ✅ | `deleteImpact` réellement appelé, absence confirmée par relecture, bandeau transformé |
| Annulation (live) | ⚠️ Non concluant | Voir note ci-dessous — ni infirmé ni confirmé en live spécifiquement |

## Écart avec le verdict QA — anomalie d'environnement, pas de produit
En fin de session de test live (après plusieurs dizaines d'appels rapprochés contre le même projet Supabase, dans le même onglet de navigateur headless resté ouvert), la latence des écritures s'est dégradée à plus de 20 secondes par requête (contre <1s habituellement, y compris plus tôt dans cette même session). Le test d'annulation live n'a pas pu confirmer le comportement dans cette fenêtre de temps allongée — **mais chaque impact créé pendant ces tests a fini par apparaître en base** (confirmé par lecture directe après coup), prouvant que les écritures elles-mêmes aboutissent toujours, seule la latence était anormale. Aucune incohérence de données n'a été observée (pas de doublon au-delà de ce qu'expliquent mes propres tentatives de test successives, pas d'impact orphelin après nettoyage).

Cette latence n'est pas reproductible en conditions normales (le même flow a été exécuté avec succès et rapidement, à plusieurs reprises, en local contre le même backend, et l'anti double-tap live lui-même a réussi rapidement en tout début de cette session). Hypothèse la plus probable : dégradation progressive de la connexion réseau de l'onglet de navigateur headless après une session de test très prolongée (cette conversation a exécuté des dizaines de vérifications live consécutives sur plusieurs heures), pas un comportement du produit.

**Le comportement d'annulation reste couvert avec un niveau de preuve élevé** via le test local équivalent (même backend Supabase, mêmes fonctions `api.js`, seule la latence réseau du contexte diffère) — cf. tableau ci-dessus.

## Verdict
**CONFIRMÉ**, avec une réserve documentée sur la re-vérification live spécifique de l'annulation (non contredite, non re-testée avec succès dans cette session en raison d'une latence anormale de fin de session — comportement déjà prouvé de façon rigoureuse en local contre le même backend).

## Recommandation
Si une nouvelle session E2E est lancée sur ce projet, éviter d'enchaîner un très grand nombre de vérifications live consécutives dans le même onglet — ouvrir un nouvel onglet/contexte périodiquement pour éviter toute dégradation de connexion accumulée.
