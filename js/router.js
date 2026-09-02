/*
 * Switch d'écran minimal — pas de routing par URL (cf. docs/architecture.md
 * §1 : usage en session continue, pas de besoin de lien profond au MVP).
 * Chaque écran s'enregistre via registerScreen(name, renderFn, onMountFn) ;
 * renderFn retourne une string HTML (état courant, synchrone) ; onMountFn
 * (optionnel) est appelé juste après l'insertion dans le DOM — c'est là que
 * les écrans câblent leurs événements et déclenchent leur chargement de
 * données asynchrone (cf. js/screens/screen-gardien.js pour un exemple).
 */

const Screens = {};

function registerScreen(name, renderFn, onMountFn){
  Screens[name] = { render: renderFn, onMount: onMountFn || null };
}

function renderScreen(name){
  const screen = Screens[name];
  const app = document.getElementById("app");
  if(!screen){
    app.innerHTML = `<div class="screen-placeholder">Écran "${name}" introuvable</div>`;
    return;
  }
  state.currentScreen = name;
  app.innerHTML = screen.render();
  if(screen.onMount) screen.onMount();
}
