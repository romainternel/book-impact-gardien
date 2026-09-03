/*
 * Formulaire de création tireur/joueur partagé entre screen-tireur.js (mode
 * Book, tireur libre) et screen-joueurs.js (mode Match, joueur d'équipe) —
 * mêmes champs (nom/club/poste/latéralité), extrait ici pour éviter la
 * duplication du référentiel POSTES et du markup, cf. docs/arch/mode-match.md §6.
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

// opts: { prefillNom, showClub (défaut true), submitLabel (défaut "Créer") }
function renderCreateTireurForm(opts){
  opts = opts || {};
  const prefillNom = opts.prefillNom || "";
  const showClub = opts.showClub !== false;
  const submitLabel = opts.submitLabel || "Créer";
  return `<div class="inline-create-tireur">
    <input type="text" id="new-tireur-nom" placeholder="Nom *" value="${escapeHtml(prefillNom)}">
    ${showClub ? `<input type="text" id="new-tireur-club" placeholder="Club">` : ""}
    <select id="new-tireur-poste">
      <option value="">Poste (optionnel)</option>
      ${POSTES.map(function(p){ return `<option value="${p.value}">${p.label}</option>`; }).join("")}
    </select>
    <div class="lat-toggle">
      <button type="button" class="lat-btn" data-action="pick-lat" data-lat="D">D</button>
      <button type="button" class="lat-btn" data-action="pick-lat" data-lat="G">G</button>
    </div>
    <button class="btn-primary" data-action="confirm-create-tireur">${escapeHtml(submitLabel)}</button>
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
