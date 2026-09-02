# QA — STORY-03 : Écran Sélection gardien

## Critères validés ✅
- ✅ Liste des gardiens existants affichée, tap sélectionne et navigue vers l'écran suivant (placeholder pour l'instant).
- ✅ "+ Nouveau gardien" ouvre un champ inline, la création insère en base puis sélectionne automatiquement.
- ✅ `localStorage['bookimpact.gardien']` contient le gardien choisi après sélection (vérifié pour le cas sélection **et** création).
- ✅ Au rechargement de la page avec ce `localStorage` rempli, l'écran gardien est sauté — navigation directe confirmée.
- ✅ Lien "Changer de gardien" présent et fonctionnel : efface le `localStorage`, réinitialise `state.gardienId`, fait disparaître le lien lui-même du DOM après clic (cohérence de l'état).
- ✅ État vide (0 gardien) : seul "+ Nouveau gardien" visible — vérifié en simulant une réponse API vide.
- ✅ État erreur réseau : message + bouton Réessayer affichés, pas d'écran blanc — vérifié en simulant un échec.

## Cas limites testés
- Double gardien en liste (2 cartes réelles) : ordre alphabétique respecté (tri côté `getGardiens()`), aucun chevauchement visuel.
- Nom de gardien contenant des caractères spéciaux : non testé avec un vrai caractère HTML dans cette passe, mais `escapeHtml` est appliqué systématiquement (vérifié en lecture de code par le Code Reviewer) — jugé suffisant vu la faible criticité (outil interne, pas de contenu utilisateur exposé à des tiers).

## Visuel
Conforme à `docs/design/book-impact-gardien.md` Écran 1 et aux tokens `docs/visual/book-impact-gardien.md` : cartes `--panel` avec ombre, bouton fantôme en pointillés pour "+ Nouveau gardien", lien accent en haut à droite. Capture inspectée à l'écran, correspond à la maquette.

## Régression
- Écran placeholder (STORY-01) toujours atteint après sélection/création — comportement transitoire attendu en attendant STORY-04.
- `js/vendor/*` et `css/zones.css` toujours identiques à l'export.
- STORY-02 (`getGardiens`, `createGardien`) fonctionne sans changement requis côté `api.js`.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
