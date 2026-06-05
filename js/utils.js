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

export function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getTeamIcon(data, side) {
  const fallback = side === "A" ? "🇮🇩" : "✤";
  return (data?.[`teamIcon${side}`] || fallback).trim();
}

export function getTeamNames(data, side) {
  const legacy = data?.[`player${side}`] || (side === "A" ? "Player A" : "Player B");
  const p1 = data?.[`player${side}1`] || legacy;
  const p2 = data?.[`player${side}2`] || "";
  const matchType = data?.matchType || (p2 ? "double" : "single");
  return {
    p1: p1 || (side === "A" ? "Player A" : "Player B"),
    p2: matchType === "double" ? p2 : "",
    matchType
  };
}

export function getTeamDisplayName(data, side) {
  const { p1, p2 } = getTeamNames(data, side);
  return p2 ? `${p1} / ${p2}` : p1;
}

export function renderTeamName(el, data, side) {
  if (!el) return;
  const { p1, p2 } = getTeamNames(data, side);
  el.innerHTML = p2
    ? `<span class="team-primary">${escapeHTML(p1)}</span><span class="team-secondary">${escapeHTML(p2)}</span>`
    : `<span class="team-primary">${escapeHTML(p1)}</span>`;
}

export function applyTeamIcon(el, iconValue, fallback = "🏸") {
  if (!el) return;
  const icon = String(iconValue || fallback).trim();
  el.classList.add("team-icon-rendered");
  el.classList.remove("has-image");
  el.style.backgroundImage = "";
  el.textContent = "";

  const looksLikeImage = /^(https?:|data:image|\.\/|\/|assets\/|images\/|img\/)/i.test(icon)
    || /\.(png|jpe?g|gif|webp|svg)$/i.test(icon);

  if (looksLikeImage) {
    el.classList.add("has-image");
    el.style.backgroundImage = `url("${icon.replaceAll('"', '%22')}")`;
  } else {
    el.textContent = icon;
  }
}
