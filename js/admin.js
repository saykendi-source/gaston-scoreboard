import { db, ref, update, onValue, get } from "./firebase-config.js";
import { getCourtNumber, courtPath, safeScore, getCurrentGameKey, calculateStatus, updateClock } from "./utils.js";

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

function render(data) {
  if (!data) return;
  currentData = data;

  setText("adminTitle", data.tournament || "GASTON SCOREBOARD");
  setText("adminRound", data.round || "-");
  setText("adminCourt", data.court || `Court ${courtNumber}`);

  setText("adminPlayerA", data.playerA || "Player A");
  setText("adminPlayerB", data.playerB || "Player B");
  setText("controlNameA", data.playerA || "Player A");
  setText("controlNameB", data.playerB || "Player B");

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

  setValue("inputTournament", data.tournament || "GASTON SCOREBOARD");
  setValue("inputRound", data.round || "");
  setValue("inputPlayerA", data.playerA || "");
  setValue("inputPlayerB", data.playerB || "");
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

  await update(courtRef, {
    playerA: data.playerB || "Player B",
    playerB: data.playerA || "Player A",
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

el("saveMatchInfo").addEventListener("click", async () => {
  saveHistory();
  await update(courtRef, {
    tournament: el("inputTournament").value.trim() || "GASTON SCOREBOARD",
    round: el("inputRound").value.trim() || "-",
    playerA: el("inputPlayerA").value.trim() || "Player A",
    playerB: el("inputPlayerB").value.trim() || "Player B"
  });
  alert("Match info berhasil disimpan.");
});

onValue(courtRef, snapshot => render(snapshot.val()));

setInterval(() => updateClock(el("adminTimer")), 1000);
updateClock(el("adminTimer"));
