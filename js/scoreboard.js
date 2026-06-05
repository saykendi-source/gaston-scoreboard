import { db, ref, onValue } from "./firebase-config.js";
import { getCourtNumber, courtPath, safeScore, updateClock, calculateStatus } from "./utils.js";

const courtNumber = getCourtNumber();
const courtRef = ref(db, courtPath(courtNumber));

const ids = {
  tournamentTitle: document.getElementById("tournamentTitle"),
  roundLabel: document.getElementById("roundLabel"),
  courtLabel: document.getElementById("courtLabel"),
  playerA: document.getElementById("playerA"),
  playerB: document.getElementById("playerB"),
  game1A: document.getElementById("game1A"),
  game1B: document.getElementById("game1B"),
  game2A: document.getElementById("game2A"),
  game2B: document.getElementById("game2B"),
  game3A: document.getElementById("game3A"),
  game3B: document.getElementById("game3B"),
  statusText: document.getElementById("statusText"),
  currentGameText: document.getElementById("currentGameText"),
  rowA: document.getElementById("rowA"),
  rowB: document.getElementById("rowB"),
  clock: document.getElementById("clock")
};

function setText(el, value) {
  if (el) el.textContent = value;
}

function renderScoreboard(data) {
  if (!data) return;

  setText(ids.tournamentTitle, data.tournament || "GASTON SCOREBOARD");
  setText(ids.roundLabel, data.round || "-");
  setText(ids.courtLabel, data.court || `Court ${courtNumber}`);
  setText(ids.playerA, data.playerA || "Player A");
  setText(ids.playerB, data.playerB || "Player B");

  setText(ids.game1A, safeScore(data?.scores?.game1?.A));
  setText(ids.game1B, safeScore(data?.scores?.game1?.B));
  setText(ids.game2A, safeScore(data?.scores?.game2?.A));
  setText(ids.game2B, safeScore(data?.scores?.game2?.B));
  setText(ids.game3A, safeScore(data?.scores?.game3?.A));
  setText(ids.game3B, safeScore(data?.scores?.game3?.B));

  setText(ids.statusText, calculateStatus(data));
  setText(ids.currentGameText, data.currentGame || 1);

  ids.rowA.classList.toggle("serving", data.server === "A");
  ids.rowB.classList.toggle("serving", data.server === "B");
}

onValue(courtRef, snapshot => renderScoreboard(snapshot.val()));

document.getElementById("fullscreenBtn")?.addEventListener("click", () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

setInterval(() => updateClock(ids.clock), 1000);
updateClock(ids.clock);
