# Architecture — Recentrage Match (écran de saisie + simplification du flow Book)

## 1. Décision technique

**Feature purement front-end, zéro migration de données.** Trois axes indépendants mais livrés ensemble : (a) retrait de `screen-impact.js` du parcours et de l'app, (b) relocalisation du code encore nécessaire à `screen-book.js`, (c) réordonnancement + habillage visuel de `screen-saisie-match.js` via un nouveau markup encadrant les fonctions vendor, sans jamais les modifier.

### Pourquoi
- **Pas de migration** : le schéma `impacts` (colonnes `type_tir`, `main`, valeurs `resultat` étendues) reste strictement inchangé — ces colonnes continuent de porter les données historiques déjà écrites par l'ancien flow, simplement plus aucune nouvelle ligne ne les renseignera (le mode Match ne les a jamais demandées, cf. `docs/arch/mode-match.md`).
- **Suppression franche plutôt que désactivation** : conforme à la doctrine déjà en vigueur dans ce projet (pas de code mort, pas de flag "au cas où") — `screen-impact.js` est retiré entièrement, pas juste rendu inaccessible par la navigation.
- **Encadrement plutôt que modification du rendu vendor** : la contrainte "ne jamais modifier `js/vendor/*` ni `css/zones.css`" (CLAUDE.md §8) est structurante pour tout l'axe visuel — chaque effet de réalisme s'obtient en ajoutant des éléments autour ou dans la marge des sorties vendor, jamais en touchant leur géométrie, leurs classes ou leurs tokens CSS possédés (`--court-fill`, `--court-line`, etc., cf. `docs/visual/recentrage-match.md` §0).

## 2. Impact sur l'existant

### 2.1 Retrait de `screen-impact.js`
- `index.html` : suppression de la ligne `<script src="js/screens/screen-impact.js"></script>`.
- `js/screens/screen-impact.js` : fichier supprimé entièrement.
- **Point d'attention critique** : `screen-impact.js` définit `RESULTAT_OPTIONS` et `resultatLabel()`, utilisés par `screen-book.js` (`renderHistoriqueRow()`, ligne `resultatLabel(impact.resultat)`) pour afficher le libellé du badge de résultat des impacts historiques (qui peuvent porter n'importe laquelle des 5 valeurs : `but`, `arret`, `poteau`, `hors_cadre`, `non_but`). Une suppression brute casserait le Book pour tout tireur ayant au moins un impact historique. **`RESULTAT_OPTIONS` et `resultatLabel()` sont déplacés tels quels dans `screen-book.js`**, en tête de fichier à côté de `ZONE_TIR_GROUPS` (même échelle, même rôle : constante de domaine utilisée uniquement par cet écran désormais).
- `TYPE_TIR_OPTIONS` et `isResultatCadre()` (également définis dans `screen-impact.js`) ne sont utilisés nulle part ailleurs dans le code (vérifié — `screen-saisie-match.js` a sa propre logique locale à 2 valeurs, sans dépendance à ces deux éléments) : **supprimés avec le reste du fichier**, sans relocalisation.

### 2.2 Navigation `screen-tireur.js`
- Ligne ~85 (`select-tireur`) : `renderScreen("impact")` → `renderScreen("book")`.
- Ligne ~152 (`confirm-create-tireur`) : `renderScreen("impact")` → `renderScreen("book")`.
- `state.tireurCourant = tireur;` reste inchangé avant l'appel — `screen-book.js` en dépend déjà pour charger les données du bon tireur.

### 2.3 Navigation `screen-book.js`
- `renderAppHeader(..., { back: "impact", ... })` → `{ back: "tireur", ... }`.
- Bouton de l'état vide ("Aucun tir enregistré pour ce tireur") : `data-action="back-to-impact"` renommé `data-action="back-to-tireur"`, libellé "Retour à la saisie" → "Retour", handler `renderScreen("impact")` → `renderScreen("tireur")`. Cohérent avec le fait qu'il n'existe plus de "saisie" accessible depuis le Book — la seule action logique est de revenir à la liste/recherche de tireurs.

### 2.4 Écran de saisie match — restructuration de layout
`screen-saisie-match.js` (`renderScreenSaisieMatch()`) : le HTML généré change d'ordre et de structure de conteneurs, sans changement de la logique de `bindScreenSaisieMatch()`, `saveMatchImpact()`, `tryAutoSaveMatch()`, `handleAnnulerDernierImpactMatch()` (toutes inchangées).

Nouvelle structure de conteneurs (remplace le bloc unique actuel) :
```html
<div class="screen-saisie-match">
  {header}
  <div class="team-roster team-roster-a">...</div>   <!-- déplacé, inchangé dans son rendu interne -->
  <div class="saisie-match-center">
    <div class="impact-section">RÉSULTAT</div>
    <div class="impact-section">
      <div class="goal-frame">
        <div class="goal-frame-bar"></div>
        {renderGoalZoneGrid(...)}  <!-- fonction vendor, appel inchangé -->
      </div>
      <div class="goal-frame-ground-shadow"></div>
    </div>
    <div class="impact-section">
      <div class="court-pick">{courtSvgMarkup()}{renderCourtZonePicker(...)}</div> <!-- inchangé -->
    </div>
  </div>
  <div class="team-roster team-roster-b">...</div>
  {renderMatchConfirmationBanner()}
</div>
```
`renderTeamRoster()` reste identique dans son contenu (liste de `.player-btn`) — seule sa position dans le DOM change (sort du wrapper `.team-rosters-row` actuel, devient un enfant direct de `.screen-saisie-match` pour permettre le placement en grille CSS, cf. §2.5).

### 2.5 Élargissement conditionnel de `#app` pour cet écran
`#app` est plafonné à `max-width: 480px` globalement (`app.css`), ce qui ne laisse pas la place à 3 colonnes réelles. Plutôt que de dupliquer `#app` ou d'introduire un système de layout par écran, la largeur est étendue **conditionnellement au contenu affiché**, en CSS pur :
```css
body:has(.screen-saisie-match) #app{
  max-width: 920px;
}
```
`:has()` est supporté par tous les navigateurs modernes ciblés par le projet (aucune contrainte de compatibilité ancienne documentée dans CLAUDE.md) — aucune ligne de JS supplémentaire nécessaire, `router.js` reste inchangé. En dessous de 760px de large, la règle `max-width:920px` ne change rien visuellement (le viewport est de toute façon plus étroit), donc aucun effet de bord sur mobile. C'est cette règle qui rend possible le layout CSS Grid à 3 colonnes spécifié par le Visual Crafter (`docs/visual/recentrage-match.md` §4) — la classe `.screen-saisie-match{ max-width: 920px }` du document Visual doit être comprise comme relayée par ce mécanisme parent, pas comme une largeur propre à un enfant qui ne peut de toute façon pas dépasser celle de son parent.

### 2.6 `js/zone-picker.js`, `js/vendor/*`, `css/zones.css`
**Aucune modification.** Toutes les fonctions (`renderCourtZonePicker`, `bindCourtZonePicker`, `buildCourtZones`, `renderGoalZoneGrid`) sont appelées exactement comme avant, avec les mêmes arguments. Le diff de ces fichiers avec leur source reste vide.

### 2.7 `css/app.css`
Ajouts uniquement (nouvelles classes `.goal-frame`, `.goal-frame-bar`, `.goal-frame-ground-shadow`, `.saisie-match-center`, règles de layout Grid, `body:has(...)`, tokens `--goal-post`/`--goal-post-stripe`/`--goal-net-line`/`--goal-shadow`/`--pitch-surround`/`--pitch-surround-line`/`--pitch-vignette`) — aucune règle existante modifiée, en particulier aucune des 7 tokens possédés par `zones.css` n'est redéfinie (règle déjà affichée en tête de `app.css`, respectée ici).

## 3. Nouvelles structures de données
Aucune. Schéma Supabase inchangé.

## 4. Nouvelles fonctions/modules
- Aucun nouveau fichier JS. Le nouveau HTML de `screen-saisie-match.js` est produit par la fonction `renderScreenSaisieMatch()` existante, restructurée.
- `RESULTAT_OPTIONS` / `resultatLabel()` : déplacés (pas nouveaux) de `screen-impact.js` vers `screen-book.js`.
- `js/screens/screen-impact.js` : supprimé.

## 5. Risques (niveau architecture — détail complet par le Risk Analyst)
- **Oubli de relocalisation** : si `RESULTAT_OPTIONS`/`resultatLabel()` ne sont pas correctement déplacés avant suppression du fichier, le Book casse silencieusement pour tout tireur avec historique (erreur JS `resultatLabel is not defined`, écran blanc ou `app.innerHTML` non mis à jour selon le point d'échec) — critère de vérification explicite pour le Developer et le QA de la story concernée.
- **`:has()` non supporté** : si un navigateur cible ne le supporte pas, le layout 3 colonnes ne s'active jamais et l'écran reste en disposition mobile empilée (dégradation silencieuse, pas de crash) — acceptable comme repli, mais à vérifier explicitement sur le navigateur réel utilisé par l'utilisateur.
- **Régression du hit-testing terrain** : l'ajout de `padding` sur `.court-pick` change la boîte de référence de `.court-svg-bg` (`inset:0`) — si mal calibré, les coordonnées visuelles du SVG et son `viewBox` restent identiques (aucun risque de désalignement du tap, le SVG entier se redimensionne uniformément dans son nouveau conteneur), mais la taille absolue du terrain à l'écran diminue légèrement (padding pris sur la largeur totale) — à vérifier sur les zones concaves (69MG/69MC/69MD) en conditions réelles, point déjà identifié comme sensible dans l'architecture de base.

## 6. Critère de bascule
Si un jour l'app a besoin de plusieurs écrans "élargis" au-delà de 480px (pas seulement la saisie match), remplacer le sélecteur `body:has(.screen-saisie-match)` ponctuel par une classe générique (`body:has(.screen-wide)`) posée sur chaque écran concerné plutôt que d'empiler des sélecteurs `:has()` un par un — non nécessaire tant qu'un seul écran est concerné.
