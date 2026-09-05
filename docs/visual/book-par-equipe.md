# Visual — Book par équipe (navigation Équipe → Joueur)

Addendum à `docs/visual/book-impact-gardien.md` et `docs/visual/mode-match.md`. Aucun nouveau token, aucune nouvelle échelle typographique — cette feature réutilise entièrement les composants existants (`.list-card`, `.list-card-row`, `.section-label`, `.empty-hint`). Cohérent avec la doctrine déjà posée : pas d'effet premium ajouté pour un écran de navigation utilitaire.

## 1. Sections "RÉCEMMENT CONSULTÉS" / "ÉQUIPES"
Réutilisent `.section-label` tel quel (déjà utilisé pour "RÉSULTAT", "ZONE DE TIR", etc.) :
```css
/* déjà défini dans app.css — aucune modification */
.section-label{ font-size: 11px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase; color: var(--t2); }
```
Espacement entre les deux sections : `margin-bottom: 16px` sur le conteneur du bandeau récents (nouvelle règle, seule addition CSS de cette feature), pour une séparation visuelle nette sans introduire de bordure ou de fond différenciés.

## 2. Ligne "🔍 Rechercher un tireur"
Doit se distinguer d'une carte d'équipe/tireur normale — c'est une action de navigation, pas une donnée, mais **pas** une action de création : `.list-card-ghost` (déjà utilisé pour "+ Créer"/"+ Nouvelle équipe", bordure pointillée) porte une sémantique "élément pas encore créé" inadaptée ici. `.list-card` pleine (solide) est réutilisée telle quelle, avec une seule règle additionnelle pour aligner le texte et la flèche :
```css
/* Seule addition CSS de cette feature au-delà du margin-bottom du §1. */
.list-card-nav{
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--accent);
}
```
Contenu : `🔍 Rechercher un tireur` à gauche, `→` à droite. Couleur `var(--accent)` (déjà la convention pour une action/lien, cf. "Changer de gardien" dans le header) — seule cette ligne porte cette couleur, les cartes d'équipe/tireur en dessous restent en `var(--t1)` (`.list-card` par défaut, inchangé).

## 3. Lignes joueur (écran "Book — Joueurs d'une équipe")
Identiques visuellement aux lignes de `screen-joueurs.js` (`.tireur-row`, `.tireur-meta`, `.tireur-lat`), **sans** les boutons ✏️/🗑 — la carte entière (`.list-card`) redevient le bouton cliquable, comme sur l'écran de recherche tireur actuel avant l'ajout des boutons d'action en STORY-15/16. Aucune nouvelle classe : c'est le même markup que `renderTireurRow()` produisait avant ces stories, simplement sans les deux boutons additionnels.

## 4. Contraste
Aucune nouvelle combinaison couleur/fond introduite — toutes les valeurs (`--t1`, `--t2`, `--accent`, `--panel`, `--border`) sont déjà validées dans `docs/visual/book-impact-gardien.md` §6 et `docs/visual/mode-match.md`. Rien à revérifier.
