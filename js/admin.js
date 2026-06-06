import { db, ref, set, update, onValue, get } from "./firebase-config.js";
import {
  getCourtNumber,
  courtPath,
  safeScore,
  getCurrentGameKey,
  calculateStatus,
  getMatchDurationText,
  getName,
  getMatchType,
  normalizeServer,
  serverTeam,
  teamLabel,
  serverLabel,
  isNeutralMatch
} from "./utils.js";

const courtNumber = getCourtNumber();
const courtRef = ref(db, courtPath(courtNumber));

let currentData = null;
let historyStack = [];

const el = id => document.getElementById(id);

function openNewMatchModal() {
  el("newMatchModal")?.classList.remove("is-hidden");
}

function closeNewMatchModal() {
  el("newMatchModal")?.classList.add("is-hidden");
}

function emptyScores() {
  return {
    game1: { A: 0, B: 0 },
    game2: { A: 0, B: 0 },
    game3: { A: 0, B: 0 }
  };
}

function getNamesFromForm() {
  const matchType = el("inputMatchType").value;
  const playerA1 = el("inputPlayerA1").value.trim();
  const playerA2 = matchType === "double" ? el("inputPlayerA2").value.trim() : "";
  const playerB1 = el("inputPlayerB1").value.trim();
  const playerB2 = matchType === "double" ? el("inputPlayerB2").value.trim() : "";

  return { matchType, playerA1, playerA2, playerB1, playerB2 };
}

function clearNameForm() {
  setValue("inputPlayerA1", "");
  setValue("inputPlayerA2", "");
  setValue("inputPlayerB1", "");
  setValue("inputPlayerB2", "");
}

async function resetCourtForNewMatch(names, neutral = false) {
  await update(courtRef, {
    tournament: el("inputTournament").value.trim() || "GASTON SCOREBOARD",
    round: el("inputRound").value.trim() || "-",
    court: `Court ${courtNumber}`,
    matchType: names.matchType || "single",
    playerA1: names.playerA1 || "",
    playerA2: names.matchType === "double" ? (names.playerA2 || "") : "",
    playerB1: names.playerB1 || "",
    playerB2: names.matchType === "double" ? (names.playerB2 || "") : "",
    playerA: names.playerA2 ? `${names.playerA1} / ${names.playerA2}` : (names.playerA1 || ""),
    playerB: names.playerB2 ? `${names.playerB1} / ${names.playerB2}` : (names.playerB1 || ""),
    neutral,
    currentGame: 1,
    server: "A1",
    status: "Waiting",
    matchStatus: "waiting",
    matchStartAt: null,
    matchEndAt: null,
    scores: emptyScores()
  });
}

function setText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function setValue(id, value) {
  const node = el(id);
  if (node) node.value = value ?? "";
}

function showDoubleFields(matchType) {
  const isDouble = matchType === "double";
  document.querySelectorAll(".double-field, .double-only").forEach(node => {
    node.classList.toggle("is-hidden", !isDouble);
  });

  if (!isDouble) {
    if (el("inputPlayerA2")) el("inputPlayerA2").value = "";
    if (el("inputPlayerB2")) el("inputPlayerB2").value = "";
  }
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

function markServer(data) {
  const server = normalizeServer(data);

  ["A1", "A2", "B1", "B2"].forEach(key => {
    document.querySelector(`[data-server="${key}"]`)?.classList.toggle("active", key === server);
  });

  ["adminA1Line", "adminA2Line", "adminB1Line", "adminB2Line"].forEach(id => {
    el(id)?.classList.remove("server-person");
  });

  const lineMap = {
    A1: "adminA1Line",
    A2: "adminA2Line",
    B1: "adminB1Line",
    B2: "adminB2Line"
  };

  el(lineMap[server])?.classList.add("server-person");
  el("adminRowA").classList.toggle("serving-team", serverTeam(server) === "A");
  el("adminRowB").classList.toggle("serving-team", serverTeam(server) === "B");
  el("controlA").classList.toggle("serving-team", serverTeam(server) === "A");
  el("controlB").classList.toggle("serving-team", serverTeam(server) === "B");
}

function markCurrentGame(data) {
  const game = Number(data?.currentGame || 1);
  const servingTeam = serverTeam(normalizeServer(data));

  ["adminRowA", "adminRowB"].forEach(id => {
    const row = el(id);
    row?.classList.remove("current-game-1", "current-game-2", "current-game-3");
    row?.classList.add(`current-game-${game}`);
  });

  ["adminGame1A", "adminGame1B", "adminGame2A", "adminGame2B", "adminGame3A", "adminGame3B"].forEach(id => {
    el(id)?.classList.remove("compact-current-score");
  });

  el(`adminGame${game}${servingTeam}`)?.classList.add("compact-current-score");
}

function updateServerButtonNames(data) {
  const neutral = isNeutralMatch(data);
  setText("serverBtnA1", neutral ? "Pemain A1" : getName(data, "playerA1", "Pemain A1"));
  setText("serverBtnA2", neutral ? "Pemain A2" : getName(data, "playerA2", "Pemain A2"));
  setText("serverBtnB1", neutral ? "Pemain B1" : getName(data, "playerB1", "Pemain B1"));
  setText("serverBtnB2", neutral ? "Pemain B2" : getName(data, "playerB2", "Pemain B2"));
}


function getServerAfterPoint(data, pointWinner, nextScoreForWinner) {
  const currentServer = normalizeServer(data);
  const currentServerTeam = serverTeam(currentServer);
  const matchType = getMatchType(data);

  // Jika poin dimenangkan oleh tim yang sedang serve,
  // server tetap orang yang sama.
  if (pointWinner === currentServerTeam) {
    return currentServer;
  }

  // Jika poin dimenangkan oleh lawan, service pindah ke tim lawan.
  // Untuk tunggal, otomatis ke orang 1.
  if (matchType !== "double") {
    return `${pointWinner}1`;
  }

  // Untuk ganda, orang yang serve ditentukan dari skor tim setelah mendapat poin:
  // skor genap -> orang 1, skor ganjil -> orang 2.
  const serverOrder = nextScoreForWinner % 2 === 0 ? "1" : "2";
  return `${pointWinner}${serverOrder}`;
}

function updateTimer() {
  setText("adminTimer", getMatchDurationText(currentData));
}

function render(data) {
  if (!data) return;
  currentData = data;

  const matchType = getMatchType(data);
  const neutral = isNeutralMatch(data);
  const a2 = neutral ? "" : getName(data, "playerA2", "");
  const b2 = neutral ? "" : getName(data, "playerB2", "");

  setText("adminTitle", data.tournament || "GASTON SCOREBOARD");
  setText("adminRound", data.round || "-");
  setText("adminCourt", data.court || `Court ${courtNumber}`);

  setText("adminPlayerA1", neutral ? "TEAM A" : getName(data, "playerA1", "TEAM A"));
  setText("adminPlayerA2", a2);
  setText("adminPlayerB1", neutral ? "TEAM B" : getName(data, "playerB1", "TEAM B"));
  setText("adminPlayerB2", b2);

  el("adminA1Line")?.classList.toggle("neutral-text", neutral);
  el("adminB1Line")?.classList.toggle("neutral-text", neutral);

  el("adminA2Line")?.classList.toggle("hidden", matchType !== "double" || !a2);
  el("adminB2Line")?.classList.toggle("hidden", matchType !== "double" || !b2);

  setText("controlNameA", neutral ? "TEAM A" : teamLabel(data, "A"));
  setText("controlNameB", neutral ? "TEAM B" : teamLabel(data, "B"));
  updateServerButtonNames(data);

  setText("adminGame1A", safeScore(data?.scores?.game1?.A));
  setText("adminGame1B", safeScore(data?.scores?.game1?.B));
  setText("adminGame2A", safeScore(data?.scores?.game2?.A));
  setText("adminGame2B", safeScore(data?.scores?.game2?.B));
  setText("adminGame3A", safeScore(data?.scores?.game3?.A));
  setText("adminGame3B", safeScore(data?.scores?.game3?.B));

  setText("adminStatus", calculateStatus(data));
  setText("adminCurrentGame", data.currentGame || 1);
  setText("adminServer", serverLabel(data));

  setValue("inputTournament", data.tournament || "GASTON SCOREBOARD");
  setValue("inputRound", data.round || "");
  setValue("inputMatchType", matchType);
  setValue("inputPlayerA1", neutral ? "" : getName(data, "playerA1", ""));
  setValue("inputPlayerA2", matchType === "double" && !neutral ? a2 : "");
  setValue("inputPlayerB1", neutral ? "" : getName(data, "playerB1", ""));
  setValue("inputPlayerB2", matchType === "double" && !neutral ? b2 : "");

  showDoubleFields(matchType);
  markServer(data);
  markCurrentGame(data);
  updateTimer();
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

  const nextScoresForGame = {
    ...(data.scores?.[gameKey] || { A: 0, B: 0 }),
    [player]: nextScore
  };

  const nextServer = delta > 0
    ? getServerAfterPoint(data, player, nextScore)
    : normalizeServer(data);

  const nextData = {
    ...data,
    scores: {
      ...(data.scores || {}),
      [gameKey]: nextScoresForGame
    },
    server: nextServer,
    matchStatus: data.matchStartAt ? "live" : "waiting"
  };

  await update(ref(db, `${courtPath(courtNumber)}/scores/${gameKey}`), {
    [player]: nextScore
  });

  await update(courtRef, {
    server: nextServer,
    status: calculateStatus(nextData),
    matchStatus: data.matchStartAt ? "live" : "waiting"
  });
}

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const player = button.dataset.player;
    const delta = button.dataset.action === "add" ? 1 : -1;
    updateScore(player, delta);
  });
});

document.querySelectorAll(".server-person-btn").forEach(button => {
  button.addEventListener("click", async () => {
    if (!currentData) return;
    saveHistory();
    await update(courtRef, { server: button.dataset.server });
  });
});

el("undoBtn").addEventListener("click", async () => {
  const last = historyStack.pop();
  if (!last) {
    alert("Belum ada riwayat untuk Undo.");
    return;
  }
  await set(courtRef, last);
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


el("newMatchBtn").addEventListener("click", async () => {
  await refreshCurrentData();
  openNewMatchModal();
});

el("newMatchCancel")?.addEventListener("click", closeNewMatchModal);

el("newMatchUsePrevious")?.addEventListener("click", async () => {
  const data = await refreshCurrentData();
  if (data) saveHistory();

  const names = {
    matchType: getMatchType(data) || el("inputMatchType").value || "single",
    playerA1: getName(data, "playerA1", el("inputPlayerA1").value.trim()),
    playerA2: getName(data, "playerA2", el("inputPlayerA2").value.trim()),
    playerB1: getName(data, "playerB1", el("inputPlayerB1").value.trim()),
    playerB2: getName(data, "playerB2", el("inputPlayerB2").value.trim())
  };

  await resetCourtForNewMatch(names, false);
  closeNewMatchModal();
  alert("Pertandingan baru disiapkan memakai nama sebelumnya. Timer tetap 00:00:00 sampai tombol Save Match Info & Start Timer diklik.");
});

el("newMatchInputNew")?.addEventListener("click", async () => {
  const data = await refreshCurrentData();
  if (data) saveHistory();

  const matchType = el("inputMatchType").value || getMatchType(data) || "single";
  clearNameForm();
  await resetCourtForNewMatch({ matchType, playerA1: "", playerA2: "", playerB1: "", playerB2: "" }, true);

  closeNewMatchModal();
  setTimeout(() => el("inputPlayerA1")?.focus(), 100);
  alert("Form nama sudah dikosongkan. Silakan masukkan nama baru, lalu klik Save Match Info & Start Timer untuk mulai pertandingan.");
});

el("finishBtn").addEventListener("click", async () => {
  if (!confirm("Selesaikan pertandingan ini?")) return;
  saveHistory();
  await update(courtRef, {
    status: "Finished",
    matchStatus: "finished",
    matchEndAt: Date.now()
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

el("inputMatchType").addEventListener("change", event => {
  showDoubleFields(event.target.value);
});

el("saveMatchInfo").addEventListener("click", async () => {
  const data = await refreshCurrentData();
  if (data) saveHistory();

  const matchType = el("inputMatchType").value;
  const playerA1 = el("inputPlayerA1").value.trim();
  const playerA2 = matchType === "double" ? el("inputPlayerA2").value.trim() : "";
  const playerB1 = el("inputPlayerB1").value.trim();
  const playerB2 = matchType === "double" ? el("inputPlayerB2").value.trim() : "";

  if (!playerA1 || !playerB1) {
    alert("Nama Tim A Orang 1 dan Tim B Orang 1 wajib diisi sebelum timer dimulai.");
    return;
  }

  await update(courtRef, {
    tournament: el("inputTournament").value.trim() || "GASTON SCOREBOARD",
    round: el("inputRound").value.trim() || "-",
    court: `Court ${courtNumber}`,
    matchType,
    playerA1,
    playerA2,
    playerB1,
    playerB2,
    playerA: playerA2 ? `${playerA1} / ${playerA2}` : playerA1,
    playerB: playerB2 ? `${playerB1} / ${playerB2}` : playerB1,
    neutral: false,
    server: matchType === "double" ? "A1" : "A1",
    matchStartAt: Date.now(),
    matchEndAt: null,
    status: "Live",
    matchStatus: "live"
  });

  alert("Match info tersimpan. Timer pertandingan sekarang dimulai dari 00:00:00.");
});

onValue(courtRef, snapshot => render(snapshot.val()));

setInterval(updateTimer, 1000);
showDoubleFields("single");
