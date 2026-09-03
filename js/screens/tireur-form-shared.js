/*
 * Formulaire de création/édition tireur/joueur partagé entre screen-tireur.js
 * (mode Book, tireur libre) et screen-joueurs.js (mode Match, joueur d'équipe) —
 * mêmes champs (nom/club/poste/latéralité), extrait ici pour éviter la
 * duplication du référentiel POSTES et du markup, cf. docs/arch/mode-match.md §6.
 * L'édition (STORY-16) réutilise le même formulaire préempli via `opts.initial`.
 */

const POSTES = [
  { value: "ailier_d", label: "Ailier D" },
  { value: "ailier_g", label: "Ailier G" },
  { value: "arriere_d", label: "Arrière D" },
  { value: "arriere_g", label: "Arrière G" },
  { value: "demi_centre", label: "Demi-centre" },
  { value: "pivot", label: "Pivot" },
  { value: "gardien_but", label: "Gardien de but" }
];

function posteLabel(value){
  const p = POSTES.find(function(p){ return p.value === value; });
  return p ? p.label : "";
}

// opts: { initial: {nom, club, poste, lateralite}, showClub (défaut true),
// submitLabel (défaut "Créer"), submitAction (défaut "confirm-create-tireur"),
// cancelAction (optionnel — affiche un bouton Annuler à côté, cf. STORY-16) }
function renderCreateTireurForm(opts){
  opts = opts || {};
  const initial = opts.initial || {};
  const showClub = opts.showClub !== false;
  const submitLabel = opts.submitLabel || "Créer";
  const submitAction = opts.submitAction || "confirm-create-tireur";
  return `<div class="inline-create-tireur">
    <input type="text" id="new-tireur-nom" placeholder="Nom *" value="${escapeHtml(initial.nom || "")}">
    ${showClub ? `<input type="text" id="new-tireur-club" placeholder="Club" value="${escapeHtml(initial.club || "")}">` : ""}
    <select id="new-tireur-poste">
      <option value="">Poste (optionnel)</option>
      ${POSTES.map(function(p){ return `<option value="${p.value}"${p.value === initial.poste ? " selected" : ""}>${p.label}</option>`; }).join("")}
    </select>
    <div class="lat-toggle">
      <button type="button" class="lat-btn${initial.lateralite === "D" ? " active" : ""}" data-action="pick-lat" data-lat="D">D</button>
      <button type="button" class="lat-btn${initial.lateralite === "G" ? " active" : ""}" data-action="pick-lat" data-lat="G">G</button>
    </div>
    <div class="inline-create-tireur-actions">
      <button class="btn-primary" data-action="${submitAction}">${escapeHtml(submitLabel)}</button>
      ${opts.cancelAction ? `<button type="button" class="btn-secondary" data-action="${opts.cancelAction}">Annuler</button>` : ""}
    </div>
  </div>`;
}

function readTireurFormFields(){
  const nom = (document.getElementById("new-tireur-nom").value || "").trim();
  const clubInput = document.getElementById("new-tireur-club");
  const club = clubInput ? (clubInput.value || "").trim() : "";
  const poste = document.getElementById("new-tireur-poste").value;
  const latBtn = document.querySelector(".lat-btn.active");
  const lateralite = latBtn ? latBtn.dataset.lat : "";
  return { nom: nom, club: club, poste: poste, lateralite: lateralite };
}

function bindLatToggle(){
  document.querySelectorAll('[data-action="pick-lat"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      document.querySelectorAll(".lat-btn").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });
}
