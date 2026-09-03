# QA — STORY-16 : Édition d'un tireur/joueur existant

## Critères validés ✅
- ✅ Bouton "Modifier" (✏️) visible sur chaque ligne, écran tireur (Book) et écran joueurs (équipe).
- ✅ Tap ouvre un formulaire pré-rempli avec les valeurs actuelles (nom, club si applicable, poste, latéralité) — vérifié avec de vraies lignes de production (tireur "64" : club vide/poste Ailier G/latéralité D ; joueur "20" : Pivot/D).
- ✅ Enregistrer avec un nom non vide → mise à jour réelle en base (vérifiée par relecture directe de l'API REST), la ligne reflète les nouvelles valeurs sans rechargement réseau de la liste entière.
- ✅ "Annuler" ferme le formulaire sans rien modifier (vérifié : aucune valeur altérée en base après annulation d'une modification de poste en cours de saisie).
- ✅ Le bouton "Modifier" ne déclenche jamais la navigation de la ligne sur l'écran tireur (ligne = bouton de sélection) — `stopPropagation` vérifié en conditions réelles, pas de navigation vers l'écran de saisie d'impact au clic sur "Modifier".
- ✅ Réédition immédiate après un premier enregistrement → formulaire pré-rempli avec les valeurs tout juste sauvegardées, pas les anciennes (pas de désynchronisation entre l'état local et la base).

## Cas limites testés
- Modifier un joueur d'équipe (écran Joueurs, pas de champ Club) : formulaire correctement adapté (`showClub: false` respecté en mode édition comme en création).
- Restauration à l'identique après modification : les deux lignes de test (tireur "64", joueur "20") ont été remises à leurs valeurs d'origine exactes après vérification, aucune perte de donnée réelle de l'utilisateur.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
