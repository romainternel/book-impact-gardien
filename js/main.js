/*
 * Bootstrap. À partir de STORY-03, l'écran de départ dépendra du gardien
 * déjà mémorisé en localStorage (cf. docs/architecture.md). Pour l'instant
 * (STORY-01), un seul écran placeholder valide que le pipeline de rendu
 * fonctionne de bout en bout.
 */

registerScreen("placeholder", function(){
  return `<div class="screen-placeholder">Book Impact Gardien</div>`;
});

document.addEventListener("DOMContentLoaded", function(){
  renderScreen("placeholder");
});
