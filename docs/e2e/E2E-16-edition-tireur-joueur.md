# E2E — STORY-16 : Édition d'un tireur/joueur existant

## Environnement de test
Serveur statique local (`http-server`) pointant sur le même backend Supabase de production (`js/config.js` inchangé) — approche cohérente avec la méthodologie retenue depuis STORY-10 (le hot-reload par `eval()` en direct sur GitHub Pages étant peu fiable, cf. `docs/e2e/E2E-10-parametres-equipes.md`), mais ici testée contre le vrai backend et de vraies lignes de production plutôt que des données de test, pour valider la policy RLS `update` réellement exercée.

## Parcours testés (Playwright, navigateur réel)

### Écran tireur (Book) — tireur libre "64"
1. Sélection gardien "Gabin" → Book par tireur → recherche "64" → tap "✏️".
2. Formulaire ouvert, pré-rempli exact (nom "64", club vide, poste "Ailier G", latéralité "D" active) — **pas de navigation vers l'écran de saisie d'impact** (stopPropagation confirmé).
3. Changement poste → "Pivot" ; annulation → valeurs inchangées en base (vérifié par requête REST directe).
4. Réouverture édition → changement réel (poste "Pivot", latéralité "G", club "TestE2E-STORY16") → Enregistrer → ligne mise à jour en direct dans la liste (`●G`, `TestE2E-STORY16 · Pivot`) → **confirmé en base** par requête REST (`poste:"pivot"`, `lateralite:"G"`, `club:"TestE2E-STORY16"`).
5. Restauration à l'identique (club vide, poste "Ailier G", latéralité "D") → Enregistrer → **confirmé restauré en base**, aucune perte de donnée réelle.

### Écran joueurs (équipe BILLERE) — joueur "20"
1. Paramètres → Équipes → BILLERE → liste des 8 joueurs réels.
2. Tap "✏️" sur "20" (Pivot/D) → formulaire pré-rempli sans champ Club (conforme `showClub:false`).
3. Changement poste → "Demi-centre" → Enregistrer → ligne mise à jour en direct → **confirmé en base** par requête REST.
4. Restauration → poste "Pivot" → Enregistrer → **confirmé restauré en base**.

## Résultat par parcours
| Parcours | Résultat | Détail |
|---|---|---|
| Formulaire pré-rempli (tireur) | ✅ | Toutes les valeurs exactes, y compris latéralité active |
| Annuler sans modification | ✅ | Aucun appel réseau d'écriture, valeurs en base inchangées |
| Enregistrer → mise à jour réelle (tireur) | ✅ | Confirmé par requête REST directe |
| stopPropagation (écran tireur) | ✅ | Aucune navigation accidentelle vers l'écran de saisie |
| Formulaire pré-rempli (joueur, sans club) | ✅ | `showClub:false` respecté en édition |
| Enregistrer → mise à jour réelle (joueur) | ✅ | Confirmé par requête REST directe |
| Restauration finale des deux lignes de production | ✅ | Aucune donnée réelle de l'utilisateur laissée altérée |

## Verdict
**CONFIRMÉ**
