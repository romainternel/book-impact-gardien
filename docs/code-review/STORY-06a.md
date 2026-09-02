# Code Review — STORY-06a : Écran Saisie impact, boucle cœur

## Conformité Architecture
- Réutilise `renderCourtZonePicker`/`bindCourtZonePicker` (STORY-05) et `renderGoalZoneGrid` (vendor, inchangé) exactement comme prévu par `docs/architecture.md`. ✅
- `header.js` étendu avec `rightLink` générique plutôt qu'une action "book" codée en dur dans le composant partagé — bonne séparation des responsabilités (l'écran câble son propre clic).

## Réutilisation vs duplication
- Aucune réimplémentation des zones — le fichier ne fait que composer les deux pickers déjà existants avec la logique métier propre à cette story (résultat, auto-save, chips).

## Scope
- Fichiers touchés : `js/screens/screen-impact.js` (nouveau), `js/screens/header.js` (extension généraliste), `js/screens/screen-tireur.js` (2 lignes, destination de navigation), `index.html`, `css/app.css`. Conforme à la story — aucun débordement vers la robustesse (verrouillage anti double-tap, bandeau erreur/annulation), explicitement laissée à STORY-06b comme prévu.

## Lisibilité et maintenabilité
- `isResultatCadre()` centralise la seule règle métier non triviale de l'écran (quels résultats nécessitent une zone de cage) — utilisée à la fois pour l'affichage (verrouillage visuel) et la validation (`tryAutoSaveImpact`), pas dupliquée.
- Le commentaire d'en-tête du fichier renvoie explicitement vers `docs/design/book-impact-gardien.md` et signale clairement que la robustesse est hors scope ici — un futur lecteur ne confondra pas "pas encore fait" avec "oublié".

## Gestion d'erreurs
- `saveImpact()` capture l'échec et **ne réinitialise pas** la sélection en cas d'erreur (déjà aligné sur l'esprit du risque P0-#1, même si le bandeau visuel explicite reste à faire en STORY-06b) — juste un `console.error`, pas d'exception non gérée qui casserait l'app.
- `onMountScreenImpact()` traite l'échec du préremplissage (`getLastImpact`) comme non bloquant, explicitement commenté — distinction correcte entre un échec d'enregistrement (critique) et un échec de préremplissage (confort, dégradation silencieuse acceptable).

## Sécurité basique
Rien de nouveau — `createImpact`/`getLastImpact`/`getImpactsForTireur` déjà audités en STORY-02, aucune nouvelle opération.

## Taille et complexité
- Story L conforme à l'estimation du Scrum Master — c'est l'écran le plus dense du MVP, la taille est justifiée par la nature de la story (cœur du produit), pas par de la sur-ingénierie.

## Point vérifié en conditions réelles
Flow complet testé en navigateur réel contre la base Supabase live-équivalente (locale) : `hors_cadre` en 2 taps, `but`/`arrêt` en 3 taps, verrouillage/déverrouillage visuel de la cage selon le résultat, réinitialisation de la sélection après enregistrement avec conservation de `type_tir`/`main`, effacement de `zone_cage` en changeant vers `hors_cadre` après une sélection de cage antérieure, préremplissage automatique de `type_tir`/`main` depuis le dernier impact à la réouverture de l'écran pour le même tireur.

## Verdict
**APPROUVÉ**
