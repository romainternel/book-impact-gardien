/*
 * Header partagé — posé en STORY-03, bouton retour ajouté en STORY-04,
 * lien générique à droite ajouté en STORY-06a (opts.rightLink = {action,
 * label} — l'écran appelant est responsable de câbler le clic sur cette
 * action, header.js reste agnostique de ce que fait chaque écran).
 */

function renderAppHeader(title, opts){
  opts = opts || {};
  const back = opts.back
    ? `<a href="#" data-action="header-back" data-screen="${escapeHtml(opts.back)}" class="header-back">←</a>`
    : "";
  let right = "";
  if(opts.showChangeGardien){
    right = `<a href="#" data-action="changer-gardien" class="header-link">Changer de gardien</a>`;
  }else if(opts.rightLink){
    right = `<a href="#" data-action="${escapeHtml(opts.rightLink.action)}" class="header-link">${escapeHtml(opts.rightLink.label)}</a>`;
  }
  return `<header class="app-header"><div class="header-left">${back}<h1 class="header-title">${escapeHtml(title)}</h1></div>${right}</header>`;
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
