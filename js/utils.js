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

export function updateClock(el) {
  if (!el) return;
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
