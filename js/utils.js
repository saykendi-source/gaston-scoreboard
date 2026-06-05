export function getCourtNumber() {
  const params = new URLSearchParams(window.location.search);
  return params.get("court") || localStorage.getItem("selectedCourt") || "1";
}

export function courtPath(courtNumber) {
  return `courts/court_${courtNumber}`;
}

export function safeScore(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function getCurrentGameKey(data) {
  const currentGame = data?.currentGame || 1;
  return `game${currentGame}`;
}

export function calculateStatus(data) {
  if (!data) return "Waiting";
  if (data.matchStatus === "finished") return "Finished";

  const gameKey = getCurrentGameKey(data);
  const a = safeScore(data?.scores?.[gameKey]?.A);
  const b = safeScore(data?.scores?.[gameKey]?.B);

  const max = Math.max(a, b);
  const min = Math.min(a, b);

  if (a === 0 && b === 0 && data.matchStatus === "waiting") return "Waiting";
  if (max >= 30) return "Game Point";
  if (a >= 20 && b >= 20 && a === b) return "Deuce";
  if (max >= 20 && max - min >= 1) return "Game Point";
  if (max === 11) return "Interval";
  return data.status || "Live";
}

export function pad2(n) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function formatDurationFromSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export function getMatchDurationText(data) {
  if (!data?.matchStartAt) return "00:00:00";
  const start = Number(data.matchStartAt);
  const end = data.matchEndAt ? Number(data.matchEndAt) : Date.now();
  return formatDurationFromSeconds((end - start) / 1000);
}

export function getName(data, key, fallback = "") {
  if (data?.[key]) return String(data[key]).trim();

  // Backward compatibility with old data.
  if (key === "playerA1" && data?.playerA) return String(data.playerA).trim();
  if (key === "playerB1" && data?.playerB) return String(data.playerB).trim();

  return fallback;
}

export function getMatchType(data) {
  if (data?.matchType === "double") return "double";
  if (getName(data, "playerA2") || getName(data, "playerB2")) return "double";
  return "single";
}

export function normalizeServer(data) {
  const server = data?.server || "A1";
  if (["A1", "A2", "B1", "B2"].includes(server)) return server;

  // Backward compatibility with old server values: A/B.
  if (server === "A") return "A1";
  if (server === "B") return "B1";

  return "A1";
}

export function serverTeam(server) {
  return String(server || "A1").startsWith("B") ? "B" : "A";
}

export function teamLabel(data, team) {
  const one = getName(data, `player${team}1`, `Player ${team}`);
  const two = getName(data, `player${team}2`, "");
  return two ? `${one} / ${two}` : one;
}

export function serverLabel(data) {
  const server = normalizeServer(data);
  const nameMap = {
    A1: getName(data, "playerA1", "Player A"),
    A2: getName(data, "playerA2", "Player A2"),
    B1: getName(data, "playerB1", "Player B"),
    B2: getName(data, "playerB2", "Player B2")
  };
  return nameMap[server] || server;
}
