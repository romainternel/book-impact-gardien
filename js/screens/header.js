/*
 * Header partagé — posé en STORY-03, destiné à être importé par les écrans
 * suivants (tireur, saisie, book) au fil de leur implémentation, cf.
 * docs/stories/STORY-03-ecran-gardien.md.
 */

function renderAppHeader(title, opts){
  opts = opts || {};
  const changeLink = opts.showChangeGardien
    ? `<a href="#" data-action="changer-gardien" class="header-link">Changer de gardien</a>`
    : "";
  return `<header class="app-header"><h1 class="header-title">${escapeHtml(title)}</h1>${changeLink}</header>`;
}

function bindAppHeader(){
  const link = document.querySelector('[data-action="changer-gardien"]');
  if(!link) return;
  link.addEventListener("click", function(evt){
    evt.preventDefault();
    clearGardienFromStorage();
    renderScreen("gardien");
  });
}
