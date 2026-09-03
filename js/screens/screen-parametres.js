/*
 * Écran Paramètres — hub secondaire (Équipes / Joueurs / Matchs).
 * Maquette : docs/design/mode-match.md — Écran Paramètres.
 * "Joueurs" et "Matchs" pointent vers des écrans pas encore livrés
 * (STORY-11/12) — fallback routeur "introuvable" attendu en attendant,
 * même pratique que le lien Book en STORY-06a.
 */

function renderScreenParametres(){
  const header = renderAppHeader("Paramètres", { back: "accueil" });

  const items = [
    { icon: "🛡️", title: "Équipes", screen: "equipes" },
    { icon: "🤾", title: "Joueurs", screen: "joueurs" },
    { icon: "📅", title: "Matchs", screen: "matchs" }
  ];

  const cards = items.map(function(m){
    return `<button class="mode-card" data-action="go-to-screen" data-screen="${m.screen}">
      <span class="mode-card-icon">${m.icon}</span>
      <span class="mode-card-title">${escapeHtml(m.title)}</span>
    </button>`;
  }).join("");

  return `
    <div class="screen-parametres">
      ${header}
      <div class="mode-card-list">${cards}</div>
    </div>
  `;
}

function bindScreenParametres(){
  bindAppHeader();
  document.querySelectorAll('[data-action="go-to-screen"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      renderScreen(btn.dataset.screen);
    });
  });
}

registerScreen("parametres", renderScreenParametres, bindScreenParametres);
