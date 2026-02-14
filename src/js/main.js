import { APP_CONFIG, RELATIONSHIP_DATE, formatDateDisplay } from "./config.js";
import { initGallery } from "./gallery.js";

function addYearsClamped(date, years) {
  const d = new Date(date);
  const month = d.getMonth();
  const day = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ms = d.getMilliseconds();

  d.setDate(1);
  d.setFullYear(d.getFullYear() + years);
  d.setMonth(month);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, maxDay));
  d.setHours(h, m, s, ms);
  return d;
}

function addMonthsClamped(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ms = d.getMilliseconds();

  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, maxDay));
  d.setHours(h, m, s, ms);
  return d;
}

function calculateCalendarDuration(from, to) {
  if (to < from) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let cursor = new Date(from);

  let years = 0;
  while (true) {
    const next = addYearsClamped(cursor, 1);
    if (next <= to) {
      cursor = next;
      years++;
    } else {
      break;
    }
  }

  let months = 0;
  while (true) {
    const next = addMonthsClamped(cursor, 1);
    if (next <= to) {
      cursor = next;
      months++;
    } else {
      break;
    }
  }

  let days = 0;
  while (true) {
    const next = new Date(cursor);
    next.setDate(next.getDate() + 1);
    if (next <= to) {
      cursor = next;
      days++;
    } else {
      break;
    }
  }

  let remainderMs = to.getTime() - cursor.getTime();
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;
  const secondMs = 1000;

  const hours = Math.floor(remainderMs / hourMs);
  remainderMs -= hours * hourMs;

  const minutes = Math.floor(remainderMs / minuteMs);
  remainderMs -= minutes * minuteMs;

  const seconds = Math.floor(remainderMs / secondMs);

  return { years, months, days, hours, minutes, seconds };
}

function plural(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function formatTogetherFor(parts) {
  return [
    plural(parts.years, "year"),
    plural(parts.months, "month"),
    plural(parts.days, "day"),
    plural(parts.hours, "hour"),
    plural(parts.minutes, "minute"),
    plural(parts.seconds, "second")
  ].join(" ");
}

function init404Page() {
  const pathEl = document.getElementById("pathText");
  const backBtn = document.getElementById("backBtn");

  if (!pathEl && !backBtn) return false;

  if (pathEl) {
    pathEl.textContent = window.location.pathname || "/";
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "./";
      }
    });
  }

  return true;
}

function initValentinePage() {
  const gateScreen = document.getElementById("gateScreen");
  const gateCard = document.getElementById("gateCard");
  const unlockForm = document.getElementById("unlockForm");
  const datePasswordInput = document.getElementById("datePassword");
  const unlockBtn = document.getElementById("unlockBtn");
  const gateError = document.getElementById("gateError");
  const cooldownText = document.getElementById("cooldownText");
  const mainContent = document.getElementById("mainContent");
  const sinceDate = document.getElementById("sinceDate");
  const togetherFor = document.getElementById("togetherFor");

  const required = [
    gateScreen,
    gateCard,
    unlockForm,
    datePasswordInput,
    unlockBtn,
    gateError,
    cooldownText,
    mainContent
  ];

  if (required.some((el) => !el)) return false;

  const relationshipStart = new Date(
    RELATIONSHIP_DATE.year,
    RELATIONSHIP_DATE.month - 1,
    RELATIONSHIP_DATE.day,
    RELATIONSHIP_DATE.hour ?? 0,
    RELATIONSHIP_DATE.minute ?? 0,
    RELATIONSHIP_DATE.second ?? 0,
    0
  );

  const state = {
    failedAttempts: 0,
    lockUntil: 0,
    cooldownIntervalId: null,
    unlocked: false,
    togetherIntervalId: null
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  function safeStorageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeStorageSet(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch {
    }
  }

  function readLockState() {
    const raw = safeStorageGet(localStorage, APP_CONFIG.lockStateStorageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const failedAttempts = Number(parsed?.failedAttempts ?? 0);
      const lockUntil = Number(parsed?.lockUntil ?? 0);

      state.failedAttempts = Number.isFinite(failedAttempts) ? Math.max(0, failedAttempts) : 0;
      state.lockUntil = Number.isFinite(lockUntil) ? Math.max(0, lockUntil) : 0;

      if (state.lockUntil <= Date.now()) {
        state.lockUntil = 0;
      }
    } catch {
      state.failedAttempts = 0;
      state.lockUntil = 0;
    }
  }

  function writeLockState() {
    safeStorageSet(
      localStorage,
      APP_CONFIG.lockStateStorageKey,
      JSON.stringify({
        failedAttempts: state.failedAttempts,
        lockUntil: state.lockUntil
      })
    );
  }

  function resetLockState() {
    state.failedAttempts = 0;
    state.lockUntil = 0;
    writeLockState();
  }

  function isLocked() {
    return state.lockUntil > Date.now();
  }

  function setError(message) {
    gateError.textContent = message;
    gateError.classList.remove("hidden");
    datePasswordInput.setAttribute("aria-invalid", "true");
  }

  function clearError() {
    gateError.textContent = "";
    gateError.classList.add("hidden");
    datePasswordInput.setAttribute("aria-invalid", "false");
  }

  function triggerShake() {
    gateCard.classList.remove("shake");
    void gateCard.offsetWidth;
    gateCard.classList.add("shake");
  }

  function enableGateControls() {
    datePasswordInput.disabled = false;
    unlockBtn.disabled = false;
  }

  function disableGateControls() {
    datePasswordInput.disabled = true;
    unlockBtn.disabled = true;
  }

  function stopCooldownTicker() {
    if (state.cooldownIntervalId) {
      clearInterval(state.cooldownIntervalId);
      state.cooldownIntervalId = null;
    }
  }

  function startCooldownTicker() {
    disableGateControls();
    cooldownText.classList.remove("hidden");

    const tick = () => {
      const remainingMs = state.lockUntil - Date.now();

      if (remainingMs <= 0) {
        stopCooldownTicker();
        state.lockUntil = 0;
        writeLockState();
        cooldownText.classList.add("hidden");
        cooldownText.textContent = "";
        enableGateControls();
        datePasswordInput.focus();
        return;
      }

      const seconds = Math.ceil(remainingMs / 1000);
      cooldownText.textContent = `Too many attempts. Try again in ${seconds}s.`;
    };

    tick();
    state.cooldownIntervalId = setInterval(tick, 250);
  }

  function isValidCalendarDate(day, month, year) {
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return false;
    if (year < 2000 || year > 2099) return false;
    if (month < 1 || month > 12) return false;

    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) return false;

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function parseDatePassword(rawInput) {
    const digits = (rawInput ?? "").replace(/\D/g, "");

    if (digits.length !== 6 && digits.length !== 8) {
      return { ok: false, reason: "format" };
    }

    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    let year = Number(digits.slice(4));

    if (digits.length === 6) {
      year += 2000;
    }

    if (!isValidCalendarDate(day, month, year)) {
      return { ok: false, reason: "invalidDate" };
    }

    return {
      ok: true,
      value: { day, month, year },
      normalized: `${pad2(day)}${pad2(month)}${year}`
    };
  }

  function matchesRelationshipDate(candidate) {
    return (
      candidate.day === RELATIONSHIP_DATE.day &&
      candidate.month === RELATIONSHIP_DATE.month &&
      candidate.year === RELATIONSHIP_DATE.year
    );
  }

  function registerFailure(message) {
    state.failedAttempts += 1;

    const attemptsLeft = APP_CONFIG.maxAttemptsBeforeCooldown - state.failedAttempts;
    if (attemptsLeft <= 0) {
      state.failedAttempts = 0;
      state.lockUntil = Date.now() + APP_CONFIG.cooldownMs;
      writeLockState();
      setError(message);
      triggerShake();
      startCooldownTicker();
      return;
    }

    writeLockState();
    setError(`${message} ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left before cooldown.`);
    triggerShake();
  }

  function startTogetherTicker() {
    if (!togetherFor) return;

    const render = () => {
      const parts = calculateCalendarDuration(relationshipStart, new Date());
      togetherFor.textContent = formatTogetherFor(parts);
    };

    render();

    if (state.togetherIntervalId) {
      clearInterval(state.togetherIntervalId);
    }
    state.togetherIntervalId = setInterval(render, 1000);
  }

  function revealMainContent({ instant = false } = {}) {
    state.unlocked = true;
    clearError();
    stopCooldownTicker();
    cooldownText.classList.add("hidden");
    startTogetherTicker();

    if (APP_CONFIG.rememberUnlockInSession) {
      safeStorageSet(sessionStorage, APP_CONFIG.unlockSessionStorageKey, "1");
    }

    if (instant) {
      gateScreen.classList.add("hidden");
      mainContent.classList.remove("hidden", "opacity-0");
      mainContent.classList.add("unlock-in");
      return;
    }

    gateScreen.classList.add("unlock-out");

    setTimeout(() => {
      gateScreen.classList.add("hidden");
      mainContent.classList.remove("hidden");
      requestAnimationFrame(() => {
        mainContent.classList.remove("opacity-0");
        mainContent.classList.add("unlock-in");
      });
    }, 460);
  }

  function onUnlockSubmit(event) {
    event.preventDefault();
    clearError();

    if (isLocked()) {
      setError("Please wait for cooldown to finish.");
      triggerShake();
      startCooldownTicker();
      return;
    }

    const parsed = parseDatePassword(datePasswordInput.value);

    if (!parsed.ok) {
      if (parsed.reason === "format") {
        registerFailure("Use DDMMYY or DDMMYYYY (separators/spaces are allowed).");
      } else {
        registerFailure("That is not a valid calendar date.");
      }
      return;
    }

    if (!matchesRelationshipDate(parsed.value)) {
      registerFailure("That date is not the right one.");
      return;
    }

    resetLockState();
    revealMainContent();
  }

  function hydrateSessionUnlock() {
    if (!APP_CONFIG.rememberUnlockInSession) return false;
    return safeStorageGet(sessionStorage, APP_CONFIG.unlockSessionStorageKey) === "1";
  }

  if (sinceDate) {
    sinceDate.textContent = formatDateDisplay(RELATIONSHIP_DATE);
  }

  initGallery();

  readLockState();
  unlockForm.addEventListener("submit", onUnlockSubmit);

  if (hydrateSessionUnlock()) {
    revealMainContent({ instant: true });
    return true;
  }

  if (isLocked()) {
    startCooldownTicker();
  } else {
    enableGateControls();
  }

  datePasswordInput.focus();
  return true;
}

function bootstrap() {
  init404Page();
  initValentinePage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
