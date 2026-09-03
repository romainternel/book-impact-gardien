# Visual — Mode Match (équipes, joueurs, saisie match complet)

Addendum à `docs/visual/book-impact-gardien.md` — étend les tokens existants, n'en redéfinit aucun. Principe conservé : pas de nouvelle teinte sans raison sémantique.

## 1. Nouveaux tokens

```css
:root{
  /* Distinction des deux équipes sur l'écran de saisie match — réutilise des
     tokens déjà définis plutôt que d'ajouter des teintes, cohérent avec la
     charte à un seul accent + couleurs de résultat sémantiques. */
  --team-a: var(--accent);        /* sky blue, déjà l'accent principal */
  --team-a-glow: var(--accent-glow);
  --team-b: var(--res-poteau);    /* ambre, déjà utilisé, bon contraste avec --team-a */
  --team-b-glow: var(--res-poteau-glow);
}
```

`resultat = 'non_but'` réutilise **`--res-horscadre`** tel quel (gris neutre) — sémantiquement cohérent : c'est déjà le token "résultat neutre, ni succès ni échec pour un camp donné" dans la palette existante. Pas de nouveau token de résultat.

## 2. Cartes de sélection de mode (écran Accueil)
Même famille visuelle que `.list-card` existant, avec une icône et un sous-titre :

```css
.mode-card{
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-card);
  transition: background .15s cubic-bezier(.4,0,.2,1), transform .15s;
}
.mode-card:active{ transform: scale(.98); }
.mode-card-icon{ font-size: 26px; }
.mode-card-title{ font-size: 15px; font-weight: 700; color: var(--t1); }
.mode-card-subtitle{ font-size: 12px; color: var(--t2); margin-top: 2px; }
```
Pas d'effet premium supplémentaire (glow, gradient) — cohérent avec la doctrine déjà posée dans le document de base ("l'app est un outil de travail, pas une vitrine").

## 3. Bouton résultat à 2 valeurs (But / Non-but)
Réutilise exactement `.result-btn` existant. Deux classes de couleur au lieu de quatre :
```css
.result-btn.result-but.active{ /* déjà défini dans app.css, inchangé */ }
.result-btn.result-non_but.active{
  box-shadow: 0 0 0 2px var(--res-horscadre), 0 0 14px var(--res-horscadre-glow);
  background: color-mix(in srgb, var(--res-horscadre) 18%, var(--panel));
  color: var(--res-horscadre);
}
```
Layout : 2 boutons occupent chacun 50% de largeur (`grid-template-columns: repeat(2, 1fr)`, jamais 4 colonnes forcées) — au repos comme sélectionné, pas de redimensionnement selon l'état.

## 4. Colonnes joueurs par équipe
```css
.team-roster{
  border-top: 3px solid var(--team-color, var(--border));
  padding-top: 10px;
}
.team-roster-a{ --team-color: var(--team-a); }
.team-roster-b{ --team-color: var(--team-b); }
.team-roster-label{
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .3px;
  color: var(--team-color, var(--t2));
  margin-bottom: 8px;
}
.player-btn{
  /* même base visuelle que .list-card, plus compact */
  padding: 10px 12px;
  margin-bottom: 6px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-s);
  color: var(--t1);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s cubic-bezier(.4,0,.2,1);
}
.player-btn:active{ transform: scale(.96); }
.player-btn.active{
  border-color: var(--team-color);
  box-shadow: 0 0 0 1px var(--team-color);
  color: var(--team-color);
}
```
La bordure supérieure colorée (`.team-roster`) suffit à distinguer les deux colonnes sans surcharger chaque bouton individuel d'une couleur — lisible même en visionnage rapide, conforme à la recommandation du PM (éviter l'erreur de sélection sous pression).

## 5. Checklist contraste
`--team-b` (`--res-poteau`, #F0A83C) sur fond sombre : même ratio déjà validé dans le document de base (~AA). `--team-a` = `--accent`, déjà validé. Aucun nouveau couple couleur/fond introduit qui n'ait pas déjà été vérifié.
