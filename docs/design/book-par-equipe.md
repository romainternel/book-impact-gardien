# Design — Book par équipe (navigation Équipe → Joueur)

## Décision de navigation
Le lien "📖 Book par tireur" de l'écran Accueil (inchangé visuellement) pointe désormais vers un nouvel écran "Book — Équipes" au lieu de l'écran de recherche actuel. La recherche existante n'est pas supprimée : elle devient un écran accessible en un tap depuis "Book — Équipes", pour les tireurs libres et la recherche rapide.

```
Accueil → Book — Équipes → Book — Joueurs (d'une équipe) → Book (inchangé)
                    ↓
              Recherche (= ancien screen-tireur.js, inchangé dans son contenu)
```

---

## Écran "Book — Équipes"

```
┌─────────────────────────────────────┐
│ ← Gabin                              │
│                                       │
│  RÉCEMMENT CONSULTÉS                 │
│  ┌───────────────────────────────┐  │
│  │ 50 ●G  Arrière D                │  │
│  │ 11 ●G  Ailier D                 │  │
│  └───────────────────────────────┘  │
│                                       │
│  🔍 Rechercher un tireur          →  │
│                                       │
│  ÉQUIPES                             │
│  ┌───────────────────────────────┐  │
│  │ BILLERE                         │  │
│  ├───────────────────────────────┤  │
│  │ FENIX                           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
- Bandeau "Récemment consultés" : identique en contenu à l'ancien état par défaut de `screen-tireur.js` (`getTireursRecents()`, jusqu'à 5), tap sur une ligne → Book direct. **Absent si aucun historique** (pas d'état vide dédié pour ce bandeau, il disparaît simplement — cohérent avec le comportement actuel où la liste était juste vide).
- Lien "🔍 Rechercher un tireur" : toujours visible, même sans historique — c'est le seul chemin vers les tireurs libres, doit être репérable au premier coup d'œil (pas une petite icône perdue). Traité comme une ligne à part entière du même gabarit que les cartes de liste, avec un chevron `→` pour signaler qu'elle mène ailleurs.
- Liste des équipes : mêmes cartes que Paramètres → Équipes, tap → écran suivant. Pas de bouton "+ Nouvelle équipe" ici (création d'équipe reste dans Paramètres, hors scope de ce parcours de lecture).
- État vide (aucune équipe créée) : `<p class="empty-hint">Aucune équipe — crée-en une dans Paramètres</p>`, le bandeau récents et le lien recherche restent visibles au-dessus.

## Écran "Book — Joueurs d'une équipe"

```
┌─────────────────────────────────────┐
│ ← BILLERE                            │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ 11        Ailier D  ●G          │  │
│  ├───────────────────────────────┤  │
│  │ 13        Demi-centre  ●D       │  │
│  ├───────────────────────────────┤  │
│  │ 50        Arrière D  ●G         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
- Titre du header = nom de l'équipe (pas "Joueurs", pour se distinguer sans ambiguïté de l'écran Paramètres → Joueurs qui porte le même genre de contenu — cf. risque PM).
- Liste des joueurs de l'équipe (`getJoueursByEquipe()`), **lignes entièrement cliquables** (contrairement à l'écran Paramètres → Joueurs où seuls ✏️/🗑 agissent) → tap n'importe où sur la ligne mène directement au Book du joueur. Pas de boutons modifier/supprimer ici (lecture seule — l'édition reste dans Paramètres → Joueurs).
- État vide : `<p class="empty-hint">Aucun joueur dans cette équipe</p>` (texte identique à celui déjà utilisé dans `screen-joueurs.js`, cohérence de ton).
- Retour → écran "Book — Équipes".

## Écran "Recherche" (= `screen-tireur.js` actuel, déplacé)
Aucun changement visuel ni fonctionnel par rapport à l'écran actuel (recherche debouncée, création, édition ✏️, suppression 🗑 — cf. capture existante). Seuls changent : son point d'entrée (accessible depuis "Book — Équipes" au lieu d'Accueil) et sa cible de retour (→ "Book — Équipes" au lieu d'Accueil).

---

## Cohérence avec l'existant
- Même gabarit de carte (`list-card-row`/`list-card`) que `screen-equipes.js`/`screen-joueurs.js`/`screen-tireur.js` — aucun nouveau composant visuel introduit.
- Même pattern de header (`renderAppHeader`, bouton retour) que tous les écrans existants.
- Le bandeau "Récemment consultés" et le lien "🔍 Rechercher" utilisent des sous-titres de section (`section-label`, déjà utilisé ailleurs dans l'app pour "RÉSULTAT", "ZONE DE TIR", etc.) plutôt qu'un nouveau style — pas de nouvelle échelle typographique.

## Responsive
Aucun changement par rapport au comportement actuel : ces écrans restent à `max-width: 480px` (pas de cas d'usage pour un layout élargi ici, contrairement à l'écran de saisie match).
