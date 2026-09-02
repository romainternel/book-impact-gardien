/*
 * Header partagé — posé en STORY-03, étendu en STORY-04 avec un bouton
 * retour (opts.back = nom d'écran cible), utilisé par les écrans suivants.
 */

function renderAppHeader(title, opts){
  opts = opts || {};
  const back = opts.back
    ? `<a href="#" data-action="header-back" data-screen="${escapeHtml(opts.back)}" class="header-back">←</a>`
    : "";
  const changeLink = opts.showChangeGardien
    ? `<a href="#" data-action="changer-gardien" class="header-link">Changer de gardien</a>`
    : "";
  return `<header class="app-header"><div class="header-left">${back}<h1 class="header-title">${escapeHtml(title)}</h1></div>${changeLink}</header>`;
}

function bindAppHeader(){
  const backLink = document.querySelector('[data-action="header-back"]');
  if(backLink){
    backLink.addEventListener("click", function(evt){
      evt.preventDefault();
      renderScreen(backLink.dataset.screen);
    });
  }

  const changeLink = document.querySelector('[data-action="changer-gardien"]');
  if(changeLink){
    changeLink.addEventListener("click", function(evt){
      evt.preventDefault();
      clearGardienFromStorage();
      renderScreen("gardien");
    });
  }
}
