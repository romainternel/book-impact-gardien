/*
 * Switch d'écran minimal — pas de routing par URL (cf. docs/architecture.md
 * §1 : usage en session continue, pas de besoin de lien profond au MVP).
 * Chaque écran s'enregistre via registerScreen(name, renderFn) ; renderFn
 * retourne une string HTML.
 */

const Screens = {};

function registerScreen(name, renderFn){
  Screens[name] = renderFn;
}

function renderScreen(name){
  const renderFn = Screens[name];
  const app = document.getElementById("app");
  if(!renderFn){
    app.innerHTML = `<div class="screen-placeholder">Écran "${name}" introuvable</div>`;
    return;
  }
  state.currentScreen = name;
  app.innerHTML = renderFn();
}
