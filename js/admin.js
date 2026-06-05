import { db, ref, update, onValue, get } from "./firebase-config.js?v=3";
import {
  getCourtNumber,
  courtPath,
  safeScore,
  getCurrentGameKey,
  calculateStatus,
  updateClock,
  renderTeamName,
  applyTeamIcon,
  getTeamIcon,
  getTeamDisplayName,
  getTeamNames
} from "./utils.js?v=3";

const courtNumber = getCourtNumber();
const courtRef = ref(db, courtPath(courtNumber));

let currentData = null;
let historyStack = [];

const el = id => document.getElementById(id);

function setText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function setValue(id, value) {
  const node = el(id);
  if (node) node.value = value ?? "";
}

function getCurrentScores(data) {
  const gameKey = getCurrentGameKey(data);
  return {
    gameKey,
    A: safeScore(data?.scores?.[gameKey]?.A),
    B: safeScore(data?.scores?.[gameKey]?.B)
  };
}

function saveHistory() {
  if (!currentData) return;
  historyStack.push(JSON.parse(JSON.stringify(currentData)));
  if (historyStack.length > 25) historyStack.shift();
}

function toggleDoubleFields() {
  const isDouble = el("inputMatchType")?.value === "double";
  document.querySelectorAll(".double-only").forEach(field => {
    field.classList.toggle("double-hidden", !isDouble);
  });
}

function renderIcons(data) {
  applyTeamIcon(el("adminIconA"), getTeamIcon(data, "A"), "🇮🇩");
  applyTeamIcon(el("adminIconB"), getTeamIcon(data, "B"), "✤");
  applyTeamIcon(el("controlIconA"), getTeamIcon(data, "A"), "🇮🇩");
  applyTeamIcon(el("controlIconB"), getTeamIcon(data, "B"), "✤");
}

function render(data) {
  if (!data) return;
  currentData = data;

  setText("adminTitle", data.tournament || "GASTON SCOREBOARD");
  setText("adminRound", data.round || "-");
  setText("adminCourt", data.court || `Court ${courtNumber}`);

  renderTeamName(el("adminPlayerA"), data, "A");
  renderTeamName(el("adminPlayerB"), data, "B");
  setText("controlNameA", getTeamDisplayName(data, "A"));
  setText("controlNameB", getTeamDisplayName(data, "B"));
  renderIcons(data);

  setText("adminGame1A", safeScore(data?.scores?.game1?.A));
  setText("adminGame1B", safeScore(data?.scores?.game1?.B));
  setText("adminGame2A", safeScore(data?.scores?.game2?.A));
  setText("adminGame2B", safeScore(data?.scores?.game2?.B));
  setText("adminGame3A", safeScore(data?.scores?.game3?.A));
  setText("adminGame3B", safeScore(data?.scores?.game3?.B));

  const status = calculateStatus(data);
  setText("adminStatus", status);
  setText("adminCurrentGame", data.currentGame || 1);
  setText("adminServer", data.server === "B" ? "Team B" : "Team A");

  el("adminRowA").classList.toggle("serving", data.server === "A");
  el("adminRowB").classList.toggle("serving", data.server === "B");
  el("controlA").classList.toggle("serving", data.server === "A");
  el("controlB").classList.toggle("serving", data.server === "B");
  el("serveToggleA").classList.toggle("on", data.server === "A");
  el("serveToggleB").classList.toggle("on", data.server === "B");

  const teamA = getTeamNames(data, "A");
  const teamB = getTeamNames(data, "B");
  const matchType = data.matchType || (teamA.p2 || teamB.p2 ? "double" : "single");

  setValue("inputTournament", data.tournament || "GASTON SCOREBOARD");
  setValue("inputRound", data.round || "");
  setValue("inputMatchType", matchType);
  setValue("inputIconA", getTeamIcon(data, "A"));
  setValue("inputIconB", getTeamIcon(data, "B"));
  setValue("inputPlayerA1", teamA.p1);
  setValue("inputPlayerA2", teamA.p2);
  setValue("inputPlayerB1", teamB.p1);
  setValue("inputPlayerB2", teamB.p2);
  toggleDoubleFields();
}

async function refreshCurrentData() {
  const snapshot = await get(courtRef);
  currentData = snapshot.val();
  return currentData;
}

async function updateScore(player, delta) {
  const data = await refreshCurrentData();
  if (!data) return;
  saveHistory();

  const { gameKey, A, B } = getCurrentScores(data);
  const current = player === "A" ? A : B;
  const nextScore = Math.max(0, current + delta);

  await update(ref(db, `${courtPath(courtNumber)}/scores/${gameKey}`), {
    [player]: nextScore
  });

  await update(courtRef, {
    server: player,
    status: calculateStatus({
      ...data,
      scores: {
        ...data.scores,
        [gameKey]: {
          ...data.scores[gameKey],
          [player]: nextScore
        }
      }
    }),
    matchStatus: "live"
  });
}

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const player = button.dataset.player;
    const delta = button.dataset.action === "add" ? 1 : -1;
    updateScore(player, delta);
  });
});

document.querySelectorAll(".serve-btn").forEach(button => {
  button.addEventListener("click", async () => {
    if (!currentData) return;
    saveHistory();
    await update(courtRef, { server: button.dataset.player });
  });
});

el("undoBtn").addEventListener("click", async () => {
  const last = historyStack.pop();
  if (!last) {
    alert("Belum ada riwayat untuk Undo.");
    return;
  }
  await update(courtRef, last);
});

el("resetRallyBtn").addEventListener("click", async () => {
  const data = await refreshCurrentData();
  if (!data) return;
  if (!confirm("Reset skor game saat ini menjadi 0-0?")) return;
  saveHistory();
  const gameKey = getCurrentGameKey(data);
  await update(ref(db, `${courtPath(courtNumber)}/scores/${gameKey}`), { A: 0, B: 0 });
  await update(courtRef, { status: "Live", matchStatus: "live" });
});

el("nextGameBtn").addEventListener("click", async () => {
  const data = await refreshCurrentData();
  if (!data) return;
  const currentGame = Number(data.currentGame || 1);
  if (currentGame >= 3) {
    alert("Sudah berada di Game 3.");
    return;
  }
  saveHistory();
  await update(courtRef, {
    currentGame: currentGame + 1,
    status: "Live",
    matchStatus: "live"
  });
});

el("finishBtn").addEventListener("click", async () => {
  if (!confirm("Selesaikan pertandingan ini?")) return;
  saveHistory();
  await update(courtRef, {
    status: "Finished",
    matchStatus: "finished"
  });
});

el("swapBtn").addEventListener("click", async () => {
  const data = await refreshCurrentData();
  if (!data) return;
  saveHistory();

  const swappedScores = {};
  ["game1", "game2", "game3"].forEach(game => {
    swappedScores[game] = {
      A: safeScore(data?.scores?.[game]?.B),
      B: safeScore(data?.scores?.[game]?.A)
    };
  });

  const teamA = getTeamNames(data, "A");
  const teamB = getTeamNames(data, "B");

  await update(courtRef, {
    playerA: getTeamDisplayName(data, "B"),
    playerB: getTeamDisplayName(data, "A"),
    playerA1: teamB.p1,
    playerA2: teamB.p2 || "",
    playerB1: teamA.p1,
    playerB2: teamA.p2 || "",
    teamIconA: getTeamIcon(data, "B"),
    teamIconB: getTeamIcon(data, "A"),
    matchType: data.matchType || (teamA.p2 || teamB.p2 ? "double" : "single"),
    server: data.server === "A" ? "B" : "A",
    scores: swappedScores
  });
});

el("adminFullscreenBtn").addEventListener("click", () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

el("fullscreenBtn")?.addEventListener("click", () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

el("homeBtn")?.addEventListener("click", () => {
  window.location.href = "index.html";
});

el("inputMatchType")?.addEventListener("change", toggleDoubleFields);

el("saveMatchInfo").addEventListener("click", async () => {
  saveHistory();

  const matchType = el("inputMatchType").value;
  const playerA1 = el("inputPlayerA1").value.trim() || "Player A";
  const playerA2 = matchType === "double" ? el("inputPlayerA2").value.trim() : "";
  const playerB1 = el("inputPlayerB1").value.trim() || "Player B";
  const playerB2 = matchType === "double" ? el("inputPlayerB2").value.trim() : "";

  await update(courtRef, {
    tournament: el("inputTournament").value.trim() || "GASTON SCOREBOARD",
    round: el("inputRound").value.trim() || "-",
    matchType,
    teamIconA: el("inputIconA").value.trim() || "🇮🇩",
    teamIconB: el("inputIconB").value.trim() || "✤",
    playerA1,
    playerA2,
    playerB1,
    playerB2,
    playerA: playerA2 ? `${playerA1} / ${playerA2}` : playerA1,
    playerB: playerB2 ? `${playerB1} / ${playerB2}` : playerB1
  });
  alert("Match info berhasil disimpan.");
});

onValue(courtRef, snapshot => render(snapshot.val()));

setInterval(() => updateClock(el("adminTimer")), 1000);
updateClock(el("adminTimer"));
