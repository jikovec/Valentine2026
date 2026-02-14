import { GALLERY_ITEMS } from "./config.js";

function makeFallbackDataUri(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1f0000"/>
          <stop offset="100%" stop-color="#000000"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#g)"/>
      <text x="50%" y="48%" fill="#d4d4d8" font-size="42" font-family="Arial, sans-serif" text-anchor="middle">
        Add photo file
      </text>
      <text x="50%" y="56%" fill="#16a34a" font-size="30" font-family="Arial, sans-serif" text-anchor="middle">
        ${label}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function normalizeIndex(index, total) {
  return (index + total) % total;
}

function detectModernSupport() {
  const canvas = document.createElement("canvas");
  const avif = canvas.toDataURL("image/avif").startsWith("data:image/avif");
  const webp = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return { avif, webp };
}

function replaceExt(src, ext) {
  return src.replace(/\.(jpe?g|png)$/i, `.${ext}`);
}

function getPreferredExt() {
  const s = detectModernSupport();
  if (s.avif) return "avif";
  if (s.webp) return "webp";
  return null;
}

function getPreferredSrc(originalSrc, preferredExt) {
  if (!preferredExt) return originalSrc;
  if (!/\.(jpe?g|png)$/i.test(originalSrc)) return originalSrc;
  return replaceExt(originalSrc, preferredExt);
}

export function initGallery({
  gridSelector = "#galleryGrid",
  modalSelector = "#galleryModal",
  imageSelector = "#modalImage",
  captionSelector = "#modalCaption",
  counterSelector = "#modalCounter",
  closeSelector = "#modalClose",
  prevSelector = "#modalPrev",
  nextSelector = "#modalNext"
} = {}) {
  const grid = document.querySelector(gridSelector);
  const modal = document.querySelector(modalSelector);
  const modalImage = document.querySelector(imageSelector);
  const modalCaption = document.querySelector(captionSelector);
  const modalCounter = document.querySelector(counterSelector);
  const closeBtn = document.querySelector(closeSelector);
  const prevBtn = document.querySelector(prevSelector);
  const nextBtn = document.querySelector(nextSelector);

  if (!grid || !modal || !modalImage || !modalCaption || !modalCounter || !closeBtn || !prevBtn || !nextBtn) {
    return { open: () => {}, close: () => {}, destroy: () => {} };
  }

  const items = Array.isArray(GALLERY_ITEMS) ? GALLERY_ITEMS.filter(Boolean) : [];
  const preferredExt = getPreferredExt();

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-[#0e5c06]/30 bg-[#1f0000]/20 p-6 text-center text-zinc-300">
        No photos configured yet. Add files to <code>assets/photos</code> and update <code>src/js/config.js</code>.
      </div>
    `;
    return { open: () => {}, close: () => {}, destroy: () => {} };
  }

  let currentIndex = 0;
  let isOpen = false;
  let previousFocusedElement = null;
  let closingTimer = null;

  function loadWithFallback(imgEl, originalSrc, labelForFallback) {
    const preferredSrc = getPreferredSrc(originalSrc, preferredExt);
    let triedOriginal = false;

    imgEl.onerror = () => {
      if (!triedOriginal && preferredSrc !== originalSrc) {
        triedOriginal = true;
        imgEl.src = originalSrc;
        return;
      }
      imgEl.onerror = null;
      imgEl.src = makeFallbackDataUri(labelForFallback);
      imgEl.classList.add("bg-[#1f0000]/30", "p-4", "object-contain");
    };

    imgEl.src = preferredSrc;
  }

  function createCard(item, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Open photo ${index + 1} of ${items.length}`);
    button.dataset.galleryIndex = String(index);
    button.className =
      "group relative overflow-hidden rounded-2xl border border-[#0e5c06]/30 bg-[#1f0000]/20 text-left transition hover:border-[#0e5c06]/60 focus:outline-none focus:ring-2 focus:ring-[#0e5c06]/50";

    const img = document.createElement("img");
    img.alt = item.alt || `Photo ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.className = "h-44 w-full object-cover transition duration-500 group-hover:scale-105 md:h-52";

    loadWithFallback(img, item.src, `photo-${String(index + 1).padStart(2, "0")}`);

    const overlay = document.createElement("div");
    overlay.className = "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5";
    overlay.textContent = item.caption || `Photo ${index + 1}`;

    button.appendChild(img);
    button.appendChild(overlay);
    return button;
  }

  function renderGrid() {
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => fragment.appendChild(createCard(item, index)));
    grid.replaceChildren(fragment);
  }

  function preloadAround(index) {
    const nextIndex = normalizeIndex(index + 1, items.length);
    const prevIndex = normalizeIndex(index - 1, items.length);

    [nextIndex, prevIndex].forEach((i) => {
      const original = items[i].src;
      const preferred = getPreferredSrc(original, preferredExt);

      const pre = new Image();
      let triedOriginal = false;
      pre.onerror = () => {
        if (!triedOriginal && preferred !== original) {
          triedOriginal = true;
          pre.src = original;
        }
      };
      pre.src = preferred;
    });
  }

  function setModalContent(index) {
    currentIndex = normalizeIndex(index, items.length);
    const item = items[currentIndex];

    modalImage.classList.remove("bg-[#1f0000]/30", "p-4");
    modalImage.classList.add("object-contain");
    modalImage.alt = item.alt || `Photo ${currentIndex + 1}`;
    loadWithFallback(modalImage, item.src, `photo-${String(currentIndex + 1).padStart(2, "0")}`);

    modalCaption.textContent = item.caption || "";
    modalCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    preloadAround(currentIndex);
  }

  function openModal(index) {
    setModalContent(index);

    if (closingTimer) {
      clearTimeout(closingTimer);
      closingTimer = null;
    }

    previousFocusedElement = document.activeElement;
    isOpen = true;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.remove("hidden");
    lockPageScroll();

    requestAnimationFrame(() => {
      modal.classList.remove("opacity-0");
      modal.classList.add("opacity-100");
    });

    try {
      closeBtn.focus({ preventScroll: true });
    } catch {
      closeBtn.focus();
    }
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;

    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    modal.setAttribute("aria-hidden", "true");
    unlockPageScroll();

    closingTimer = setTimeout(() => {
      modal.classList.add("hidden");
      closingTimer = null;
      if (previousFocusedElement && typeof previousFocusedElement.focus === "function") {
        try {
          previousFocusedElement.focus({ preventScroll: true });
        } catch {
          previousFocusedElement.focus();
        }
      }
    }, 260);
  }

  function onGridClick(event) {
    const button = event.target.closest("[data-gallery-index]");
    if (!button) return;

    const index = Number(button.dataset.galleryIndex);
    if (Number.isNaN(index)) return;
    openModal(index);
  }

  function onKeyDown(event) {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setModalContent(currentIndex + 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setModalContent(currentIndex - 1);
    }

    if (event.key === "Tab") {
      trapTabKey(event);
      return;
    }
  }

  function onModalClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.hasAttribute("data-modal-close") || target === modal) {
      closeModal();
    }
  }

  function getFocusableInModal() {
    return Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el instanceof HTMLElement && !el.hasAttribute("aria-hidden"));
  }

  function trapTabKey(event) {
    const focusable = getFocusableInModal();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !modal.contains(active)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  let lockedScrollY = 0;

  function lockPageScroll() {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockPageScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedScrollY);
  }

  const onPrevClick = () => setModalContent(currentIndex - 1);
  const onNextClick = () => setModalContent(currentIndex + 1);

  renderGrid();

  grid.addEventListener("click", onGridClick);
  document.addEventListener("keydown", onKeyDown);
  modal.addEventListener("click", onModalClick);
  closeBtn.addEventListener("click", closeModal);
  prevBtn.addEventListener("click", onPrevClick);
  nextBtn.addEventListener("click", onNextClick);

  return {
    open: openModal,
    close: closeModal,
    destroy() {
      grid.removeEventListener("click", onGridClick);
      document.removeEventListener("keydown", onKeyDown);
      modal.removeEventListener("click", onModalClick);
      closeBtn.removeEventListener("click", closeModal);
      prevBtn.removeEventListener("click", onPrevClick);
      nextBtn.removeEventListener("click", onNextClick);
    }
  };
}
