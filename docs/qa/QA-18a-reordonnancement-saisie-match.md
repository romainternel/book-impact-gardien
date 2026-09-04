# QA — STORY-18a : Réordonnancement de l'écran de saisie match

## Méthode
Test en navigateur réel (Playwright) contre le backend de production, sur le vrai match "J01 · BILLERE vs FENIX". Vérification systématique des largeurs de viewport aux bornes exactes des paliers (479/480/759/760px), pas seulement à une largeur représentative de chaque palier — c'est cette vérification aux bornes qui a permis de détecter le bug ci-dessous.

## Bug trouvé et corrigé — zone morte à exactement 759px de large
**Sévérité initiale : Majeur.** À une largeur de viewport de très exactement 759px, ni la media query `(min-width:480px) and (max-width:759px)` ni `(min-width:760px)` ne s'appliquaient (`window.matchMedia(...).matches` → `false` pour les deux, vérifié directement), et l'écran retombait sur le layout mobile à 1 colonne (`grid-template-columns` calculé : une seule valeur au lieu de deux ou trois). Cause : au chargement à une largeur demandée de 759px, le viewport CSS réel du navigateur résout à une valeur fractionnaire légèrement supérieure à 759 (probablement liée à un `devicePixelRatio` non exactement égal à 1 sur cet environnement), ce qui fait échouer `max-width:759px` sans pour autant satisfaire `min-width:760px` — un vrai "trou" entre deux bornes entières adjacentes, indépendant du code applicatif mais bien réel pour l'utilisateur si sa fenêtre/zoom tombe pile sur cette valeur.

**Correction** : `max-width: 759px` → `max-width: 759.98px` dans `css/app.css` (marge de sécurité sous la borne entière suivante). Revérifié : à 759px exact, `gridTemplateColumns` est de nouveau `348px 348px` (palier 2 colonnes correct). Bornes 479/480/760 revérifiées également saines (1 colonne / 2 colonnes / 3 colonnes respectivement).

## Critères validés ✅
- ✅ Ordre Résultat → Zone de cage → Zone de tir (vérifié visuellement à 3 largeurs).
- ✅ < 480px (testé à 375px et 479px) : pile verticale complète, chaque bloc pleine largeur.
- ✅ 480-759px (testé à 480px, 600px, 759px après correction) : rosters en rangée à 2 colonnes sous le bloc central.
- ✅ ≥ 760px (testé à 760px et 1000px) : rosters en colonnes latérales, `#app` élargi à 920px (`getComputedStyle` vérifié directement, pas seulement visuellement).
- ✅ Liseré de couleur d'équipe (bleu BILLERE / orange FENIX) visible en haut de chaque colonne roster à ≥760px — correction du Code Reviewer confirmée en direct.
- ✅ Aucune fuite de largeur : navigation saisie-match → retour arrière → `#app` revient bien à `max-width:480px` (`getComputedStyle` vérifié), y compris à un viewport large (1000px).
- ✅ Comportement fonctionnel inchangé : cycle complet (Résultat "But" → Zone de cage → Zone de tir dont une zone concave `69MC` → sélection joueur) déclenche l'auto-save, crée un impact réel en base, bandeau de confirmation affiché avec le bon libellé — testé aux paliers 1000px et 759px (le palier qui posait problème), dans les deux cas succès.
- ✅ Verrouillage anti double-tap (`.match-saving`) : vérifié que la classe désactive bien (`opacity:.7; pointer-events:none`) le bloc central ET les deux rosters, tout en laissant le header pleinement interactif (`opacity:1; pointer-events:auto`) — comportement identique à l'ancien mécanisme.
- ✅ Bandeau de confirmation/erreur en pleine largeur en layout 3 colonnes (`grid-column:1/-1` confirmé).

## Cas limites testés
- Bornes exactes des paliers responsive (479/480/759/760px) — c'est ce test qui a révélé le bug ci-dessus, pas seulement une largeur "au milieu" de chaque palier.
- Équipe sans aucun joueur (FENIX, données réelles) : état vide ("Aucun joueur") correctement affiché dans sa colonne, sans casser le layout en grille à aucun palier.
- Zone concave du terrain (`69MC`) : toujours résolue correctement (impact enregistré avec `zone_tir:"69MC"`), aux deux largeurs testées.

## Régressions détectées
Aucune — deux impacts de test créés pendant la vérification (`863a51d8...`, `437172ba...`) supprimés après coup, aucune donnée réelle de production altérée.

## Verdict
**PASSED** (après correction du bug de zone morte à 759px, appliquée et revérifiée pendant cette même passe QA).
