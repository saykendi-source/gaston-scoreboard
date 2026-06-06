const courts = [1, 2, 3, 4, 5, 6];
const courtGrid = document.getElementById("courtGrid");
const openView = document.getElementById("openView");
const resetSelection = document.getElementById("resetSelection");
const viewCards = document.querySelectorAll(".view-card");

let selectedCourt = localStorage.getItem("selectedCourt") || "1";
let selectedView = localStorage.getItem("selectedView") || "scoreboard";

function renderCourts() {
  courtGrid.innerHTML = "";
  courts.forEach(court => {
    const btn = document.createElement("button");
    btn.className = `court-card ${String(court) === selectedCourt ? "selected" : ""}`;
    btn.innerHTML = `
      <span class="court-icon">▤</span>
      <b>Court ${court}</b>
      <span class="select-dot">✓</span>
    `;
    btn.addEventListener("click", () => {
      selectedCourt = String(court);
      localStorage.setItem("selectedCourt", selectedCourt);
      renderCourts();
    });
    courtGrid.appendChild(btn);
  });
}

function renderViews() {
  viewCards.forEach(card => {
    card.classList.toggle("selected", card.dataset.view === selectedView);
    card.onclick = () => {
      selectedView = card.dataset.view;
      localStorage.setItem("selectedView", selectedView);
      renderViews();
    };
  });
}

openView.addEventListener("click", () => {
  const page = selectedView === "admin" ? "admin.html" : "scoreboard.html";
  window.location.href = `${page}?court=${selectedCourt}`;
});

resetSelection.addEventListener("click", () => {
  selectedCourt = "1";
  selectedView = "scoreboard";
  localStorage.setItem("selectedCourt", selectedCourt);
  localStorage.setItem("selectedView", selectedView);
  renderCourts();
  renderViews();
});

renderCourts();
renderViews();
