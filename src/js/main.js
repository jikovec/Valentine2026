import {
  APP_CONFIG,
  RELATIONSHIP_DATE,
  PASSWORD_HINTS,
  LETTER_LINES,
  TIMELINE_ITEMS,
  MUSIC_CONFIG,
  formatDateDisplay
} from "./config.js";
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
  const hintText = document.getElementById("hintText");
  const mainContent = document.getElementById("mainContent");
  const sinceDate = document.getElementById("sinceDate");
  const togetherFor = document.getElementById("togetherFor");
  const nextAnniversary = document.getElementById("nextAnniversary");
  const nextMilestone = document.getElementById("nextMilestone");
  const timelineList = document.getElementById("timelineList");
  const letterText = document.getElementById("letterText");
  const petals = document.getElementById("unlockPetals");

  const musicAudio = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicVolume = document.getElementById("musicVolume");
  const musicStatus = document.getElementById("musicStatus");
  const musicConsent = document.getElementById("musicConsent");
  const musicConsentYes = document.getElementById("musicConsentYes");
  const musicConsentNo = document.getElementById("musicConsentNo");

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
    togetherIntervalId: null,
    galleryApi: null,
    letterTimer: null,
    letterStarted: false
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

  function clearHint() {
    if (!hintText) return;
    hintText.textContent = "";
    hintText.classList.add("hidden");
  }

  function setHint(message) {
    if (!hintText || !message) return;
    hintText.textContent = message;
    hintText.classList.remove("hidden");
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

    const hintIndex = Math.min(state.failedAttempts - 1, PASSWORD_HINTS.length - 1);
    if (hintIndex >= 0) {
      setHint(PASSWORD_HINTS[hintIndex]);
    }

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

  function formatNextAnniversaryText(now) {
    let next = new Date(
      now.getFullYear(),
      relationshipStart.getMonth(),
      relationshipStart.getDate(),
      relationshipStart.getHours(),
      relationshipStart.getMinutes(),
      relationshipStart.getSeconds(),
      0
    );

    if (next <= now) {
      next = addYearsClamped(next, 1);
    }

    const ms = Math.max(0, next.getTime() - now.getTime());
    const totalHours = Math.ceil(ms / (60 * 60 * 1000));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days} day${days === 1 ? "" : "s"} ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  function formatMilestoneText(now) {
    const diffMs = Math.max(0, now.getTime() - relationshipStart.getTime());
    const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const nextTarget = Math.ceil((totalDays + 1) / 100) * 100;
    const daysLeft = Math.max(1, nextTarget - totalDays);
    return `${nextTarget}-day mark in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
  }

  function startTogetherTicker() {
    const render = () => {
      const now = new Date();
      const parts = calculateCalendarDuration(relationshipStart, now);
      if (togetherFor) togetherFor.textContent = formatTogetherFor(parts);
      if (nextAnniversary) nextAnniversary.textContent = formatNextAnniversaryText(now);
      if (nextMilestone) nextMilestone.textContent = formatMilestoneText(now);
    };

    render();

    if (state.togetherIntervalId) {
      clearInterval(state.togetherIntervalId);
    }
    state.togetherIntervalId = setInterval(render, 1000);
  }

  function renderTimeline() {
    if (!timelineList) return;

    if (!Array.isArray(TIMELINE_ITEMS) || TIMELINE_ITEMS.length === 0) {
      timelineList.innerHTML = "";
      return;
    }

    const fragment = document.createDocumentFragment();

    TIMELINE_ITEMS.forEach((item) => {
      const card = document.createElement("article");
      card.className = "timeline-card rounded-2xl border border-[#0e5c06]/30 bg-[#1f0000]/20 p-4 md:p-5";

      const date = document.createElement("p");
      date.className = "text-xs uppercase tracking-[0.18em] text-emerald-300";
      date.textContent = item.date || "";

      const title = document.createElement("h4");
      title.className = "mt-2 text-lg font-semibold text-white";
      title.textContent = item.title || "Memory";

      const text = document.createElement("p");
      text.className = "mt-2 text-sm text-zinc-300 md:text-base";
      text.textContent = item.text || "";

      card.appendChild(date);
      card.appendChild(title);
      card.appendChild(text);
      fragment.appendChild(card);
    });

    timelineList.replaceChildren(fragment);
  }

  function startLetterTyping() {
    if (!letterText || state.letterStarted) return;
    state.letterStarted = true;

    const fullText = Array.isArray(LETTER_LINES) ? LETTER_LINES.join("\n") : "";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      letterText.textContent = fullText;
      letterText.classList.add("is-complete");
      return;
    }

    let index = 0;
    letterText.textContent = "";

    state.letterTimer = setInterval(() => {
      index += 1;
      letterText.textContent = fullText.slice(0, index);
      if (index >= fullText.length) {
        clearInterval(state.letterTimer);
        state.letterTimer = null;
        letterText.classList.add("is-complete");
      }
    }, 22);
  }

  function burstUnlockPetals() {
    if (!petals) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    petals.innerHTML = "";

    const count = 34;
    for (let i = 0; i < count; i += 1) {
      const node = document.createElement("span");
      node.className = "unlock-petal";
      node.textContent = i % 6 === 0 ? "❀" : "❤";
      node.style.left = `${Math.random() * 100}%`;
      node.style.setProperty("--dur", `${2.2 + Math.random() * 1.4}s`);
      node.style.setProperty("--delay", `${Math.random() * 0.35}s`);
      node.style.setProperty("--drift", `${-28 + Math.random() * 56}px`);
      petals.appendChild(node);
    }

    setTimeout(() => {
      petals.innerHTML = "";
    }, 4200);
  }

  function initMusic() {
    if (!musicAudio || !musicToggle || !musicVolume || !musicStatus || !musicConsent || !musicConsentYes || !musicConsentNo) {
      return;
    }

    const configuredSources = Array.isArray(MUSIC_CONFIG.sources)
      ? MUSIC_CONFIG.sources.filter((item) => item && typeof item.src === "string")
      : [];

    const sources = configuredSources.length > 0
      ? configuredSources
      : [{ src: MUSIC_CONFIG.src, type: "" }];

    let sourceIndex = -1;

    const sourceOrder = [
      ...sources
        .map((source, index) => ({ source, index }))
        .filter(({ source }) => !source.type || musicAudio.canPlayType(source.type) !== "")
        .map(({ index }) => index),
      ...sources
        .map((_, index) => index)
        .filter((index) => {
          const source = sources[index];
          return source.type && musicAudio.canPlayType(source.type) === "";
        })
    ];

    function setSourceByIndex(nextIndex) {
      if (nextIndex < 0 || nextIndex >= sources.length) return;
      if (sourceIndex === nextIndex) return;

      sourceIndex = nextIndex;
      musicAudio.src = sources[sourceIndex].src;
      musicAudio.load();
    }

    const storedVolume = Number(safeStorageGet(localStorage, APP_CONFIG.musicVolumeStorageKey));
    const initialVolume = Number.isFinite(storedVolume)
      ? Math.max(0, Math.min(1, storedVolume))
      : MUSIC_CONFIG.defaultVolume;

    musicAudio.volume = initialVolume;
    musicVolume.value = String(initialVolume);

    const setMusicStatus = (text) => {
      musicStatus.textContent = text;
    };

    const syncMusicButton = () => {
      musicToggle.textContent = musicAudio.paused ? "Play" : "Pause";
    };

    const playMusic = async (isAuto = false) => {
      const order = sourceOrder.length > 0 ? sourceOrder : sources.map((_, index) => index);
      const attemptOrder = sourceIndex >= 0
        ? [sourceIndex, ...order.filter((index) => index !== sourceIndex)]
        : order;

      for (const index of attemptOrder) {
        setSourceByIndex(index);
        try {
          await musicAudio.play();
          syncMusicButton();
          setMusicStatus("Playing in background.");
          return true;
        } catch {
        }
      }

      syncMusicButton();
      setMusicStatus(
        "Could not play this audio format on this device. Add music.mp3 or music.m4a in assets/audio."
      );
      return false;
    };

    const pauseMusic = () => {
      musicAudio.pause();
      syncMusicButton();
      setMusicStatus("Music is paused.");
    };

    musicAudio.addEventListener("error", () => {
      setMusicStatus(
        "Audio failed to load. Add a mobile format: assets/audio/music.mp3 or assets/audio/music.m4a."
      );
      syncMusicButton();
    });

    musicToggle.addEventListener("click", async () => {
      if (musicAudio.paused) {
        await playMusic(false);
        return;
      }
      pauseMusic();
    });

    musicVolume.addEventListener("input", () => {
      const next = Number(musicVolume.value);
      musicAudio.volume = Number.isFinite(next) ? Math.max(0, Math.min(1, next)) : MUSIC_CONFIG.defaultVolume;
      safeStorageSet(localStorage, APP_CONFIG.musicVolumeStorageKey, String(musicAudio.volume));
    });

    musicAudio.addEventListener("play", syncMusicButton);
    musicAudio.addEventListener("pause", syncMusicButton);

    if (sourceOrder.length > 0) {
      setSourceByIndex(sourceOrder[0]);
    }

    const consent = safeStorageGet(localStorage, APP_CONFIG.musicConsentStorageKey);

    if (consent === "yes") {
      musicConsent.classList.add("hidden");
      if (MUSIC_CONFIG.autoplayAfterConsent) {
        playMusic(true);
      }
      return;
    }

    if (consent === "no") {
      musicConsent.classList.add("hidden");
      setMusicStatus("Music is paused.");
      return;
    }

    musicConsent.classList.remove("hidden");

    musicConsentYes.addEventListener("click", async () => {
      safeStorageSet(localStorage, APP_CONFIG.musicConsentStorageKey, "yes");
      musicConsent.classList.add("hidden");
      await playMusic(true);
    });

    musicConsentNo.addEventListener("click", () => {
      safeStorageSet(localStorage, APP_CONFIG.musicConsentStorageKey, "no");
      musicConsent.classList.add("hidden");
      pauseMusic();
    });
  }

  function ensureGalleryInitialized() {
    if (!state.galleryApi) {
      state.galleryApi = initGallery();
    }
    if (state.galleryApi && typeof state.galleryApi.syncHash === "function") {
      state.galleryApi.syncHash();
    }
  }

  function revealMainContent({ instant = false } = {}) {
    state.unlocked = true;
    clearError();
    clearHint();
    stopCooldownTicker();
    cooldownText.classList.add("hidden");
    startTogetherTicker();
    renderTimeline();
    startLetterTyping();
    initMusic();

    if (APP_CONFIG.rememberUnlockInSession) {
      safeStorageSet(sessionStorage, APP_CONFIG.unlockSessionStorageKey, "1");
    }

    burstUnlockPetals();

    if (instant) {
      gateScreen.classList.add("hidden");
      mainContent.classList.remove("hidden", "opacity-0");
      mainContent.classList.add("unlock-in");
      ensureGalleryInitialized();
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
      ensureGalleryInitialized();
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
        registerFailure("Day month year.");
      } else {
        registerFailure("That is not a valid calendar date.");
      }
      return;
    }

    if (!matchesRelationshipDate(parsed.value)) {
      registerFailure("WRONGGG.");
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
