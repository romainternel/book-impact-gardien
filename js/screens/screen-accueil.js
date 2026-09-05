/*
 * Écran Accueil — hub de choix de mode, inséré entre la sélection gardien
 * et les deux modes de saisie (Book par tireur existant, Match nouveau) +
 * Paramètres. Maquette : docs/design/mode-match.md — Écran Accueil.
 */

function renderScreenAccueil(){
  const header = renderAppHeader(state.gardienNom || "Book Impact Gardien", { showChangeGardien: true });

  const modes = [
    { icon: "📖", title: "Book par tireur", subtitle: "Scouter un tireur adverse", screen: "book-equipes" },
    { icon: "⚽", title: "Saisir un match", subtitle: "Documenter un match complet", screen: "selection-match" },
    { icon: "⚙️", title: "Paramètres", subtitle: "Équipes, joueurs, matchs", screen: "parametres" }
  ];

  const cards = modes.map(function(m){
    return `<button class="mode-card" data-action="go-to-screen" data-screen="${m.screen}">
      <span class="mode-card-icon">${m.icon}</span>
      <span>
        <span class="mode-card-title">${escapeHtml(m.title)}</span>
        <span class="mode-card-subtitle">${escapeHtml(m.subtitle)}</span>
      </span>
    </button>`;
  }).join("");

  return `
    <div class="screen-accueil">
      ${header}
      <p class="screen-subtitle">Qu'est-ce que tu veux faire ?</p>
      <div class="mode-card-list">${cards}</div>
    </div>
  `;
}

function bindScreenAccueil(){
  bindAppHeader();
  document.querySelectorAll('[data-action="go-to-screen"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      renderScreen(btn.dataset.screen);
    });
  });
}

registerScreen("accueil", renderScreenAccueil, bindScreenAccueil);
