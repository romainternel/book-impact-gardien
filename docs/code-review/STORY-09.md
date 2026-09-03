# Code Review — STORY-09 : Écran Accueil

## Conformité Architecture
- Nouveau hub inséré conformément à `docs/design/mode-match.md`, pattern `register/render/bind` identique aux écrans existants. ✅

## Réutilisation vs duplication
- `renderAppHeader`/`bindAppHeader` réutilisés sans extension nécessaire (le cas `showChangeGardien` sans `back` existait déjà). Aucun nouveau composant header requis.

## Scope
- Fichiers touchés : `js/screens/screen-accueil.js` (nouveau), `js/main.js`, `js/screens/screen-gardien.js` (2 lignes), `js/screens/screen-tireur.js` (1 ligne, cf. point ci-dessous), `index.html`, `css/app.css`.
- **Point détecté par le Developer, hors du périmètre écrit de la story mais nécessaire à sa cohérence** : le bouton retour de l'écran tireur pointait vers `"gardien"`, cassant la logique de navigation une fois Accueil inséré entre les deux (retour aurait sauté l'étape de choix de mode). Corrigé vers `"accueil"`. C'est exactement le genre d'impact sur l'existant qu'une story d'insertion d'écran intermédiaire doit anticiper — bon réflexe de l'avoir corrigé plutôt que de le découvrir en QA.

## Lisibilité et maintenabilité
- Liste de modes déclarative (`icon/title/subtitle/screen`) plutôt que trois blocs HTML dupliqués — ajouter un futur 4e mode sera trivial.

## Gestion d'erreurs
Sans objet — écran de navigation pure, pas d'appel réseau.

## Sécurité basique
Rien de nouveau.

## Taille et complexité
Story S conforme.

## Point vérifié en conditions réelles
Flux complet testé : gardien → Accueil (routage confirmé), Accueil → Book par tireur → retour → Accueil (pas vers Gardien), liens Paramètres/Sélection Match affichent le fallback routeur attendu (cibles pas encore livrées). Recherche tireur toujours fonctionnelle après la correction du bouton retour — non-régression confirmée.

## Verdict
**APPROUVÉ**
