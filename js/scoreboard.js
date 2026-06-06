import { db, ref, onValue } from "./firebase-config.js";
import {
  getCourtNumber,
  courtPath,
  safeScore,
  calculateStatus,
  getName,
  getMatchType,
  normalizeServer,
  serverTeam,
  getMatchDurationText,
  isNeutralMatch
} from "./utils.js";

const courtNumber = getCourtNumber();
const courtRef = ref(db, courtPath(courtNumber));

let currentData = null;

const ids = {
  tournamentTitle: document.getElementById("tournamentTitle"),
  roundLabel: document.getElementById("roundLabel"),
  courtLabel: document.getElementById("courtLabel"),
  playerA1: document.getElementById("playerA1"),
  playerA2: document.getElementById("playerA2"),
  playerB1: document.getElementById("playerB1"),
  playerB2: document.getElementById("playerB2"),
  playerA1Line: document.getElementById("playerA1Line"),
  playerA2Line: document.getElementById("playerA2Line"),
  playerB1Line: document.getElementById("playerB1Line"),
  playerB2Line: document.getElementById("playerB2Line"),
  game1A: document.getElementById("game1A"),
  game1B: document.getElementById("game1B"),
  game2A: document.getElementById("game2A"),
  game2B: document.getElementById("game2B"),
  game3A: document.getElementById("game3A"),
  game3B: document.getElementById("game3B"),
  statusText: document.getElementById("statusText"),
  currentGameText: document.getElementById("currentGameText"),
  matchTimerText: document.getElementById("matchTimerText"),
  footerTimer: document.getElementById("footerTimer"),
  rowA: document.getElementById("rowA"),
  rowB: document.getElementById("rowB")
};

function setText(el, value) {
  if (el) el.textContent = value;
}

function markServer(server) {
  ["A1", "A2", "B1", "B2"].forEach(key => {
    ids[`player${key}Line`]?.classList.toggle("server-person", key === server);
  });
  ids.rowA.classList.toggle("serving-team", serverTeam(server) === "A");
  ids.rowB.classList.toggle("serving-team", serverTeam(server) === "B");
}

function renderPlayerNames(data) {
  const matchType = getMatchType(data);

  const neutral = isNeutralMatch(data);
  setText(ids.playerA1, neutral ? "TEAM A" : getName(data, "playerA1", "TEAM A"));
  setText(ids.playerB1, neutral ? "TEAM B" : getName(data, "playerB1", "TEAM B"));

  const a2 = getName(data, "playerA2", "");
  const b2 = getName(data, "playerB2", "");

  setText(ids.playerA2, a2);
  setText(ids.playerB2, b2);

  ids.playerA2Line.classList.toggle("hidden", matchType !== "double" || !a2);
  ids.playerB2Line.classList.toggle("hidden", matchType !== "double" || !b2);
}

function renderTimer() {
  const text = getMatchDurationText(currentData);
  setText(ids.matchTimerText, text);
  setText(ids.footerTimer, `Match Time ${text}`);
}

function renderScoreboard(data) {
  if (!data) return;
  currentData = data;

  setText(ids.tournamentTitle, data.tournament || "GASTON SCOREBOARD");
  setText(ids.roundLabel, data.round || "-");
  setText(ids.courtLabel, data.court || `Court ${courtNumber}`);

  renderPlayerNames(data);

  setText(ids.game1A, safeScore(data?.scores?.game1?.A));
  setText(ids.game1B, safeScore(data?.scores?.game1?.B));
  setText(ids.game2A, safeScore(data?.scores?.game2?.A));
  setText(ids.game2B, safeScore(data?.scores?.game2?.B));
  setText(ids.game3A, safeScore(data?.scores?.game3?.A));
  setText(ids.game3B, safeScore(data?.scores?.game3?.B));

  setText(ids.statusText, calculateStatus(data));
  setText(ids.currentGameText, data.currentGame || 1);

  markServer(normalizeServer(data));
  renderTimer();
}

onValue(courtRef, snapshot => renderScoreboard(snapshot.val()));

document.getElementById("fullscreenBtn")?.addEventListener("click", () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

setInterval(renderTimer, 1000);
