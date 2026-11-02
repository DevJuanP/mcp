/* ============================================================
   deck.js — navegación, chrome, overlays, tema, atajos
   ============================================================ */
(() => {
  "use strict";

  const slides = Array.from(document.querySelectorAll("#slides > .slide"));
  const total = slides.length;
  if (!total) return;

  const root = document.documentElement;
  const stage = document.getElementById("stage");
  const deck = document.getElementById("deck");
  const counter = document.getElementById("cur");
  const totalEl = document.getElementById("total");
  const progress = document.getElementById("progress-fill");
  const live = document.getElementById("live");
  const metaTheme = document.getElementById("theme-color");
  const notesTitle = document.getElementById("notes-title");
  const notesBody = document.getElementById("notes-body");
  const notesLabel = document.getElementById("notes-label");

  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (n) => Math.max(0, Math.min(total - 1, n));

  let index = 0;
  let openPanel = null;
  let lastFocus = null;

  /* ---------- Chrome por slide ---------- */

  slides.forEach((slide, i) => {
    const fig = slide.dataset.fig;
    if (fig) {
      const el = document.createElement("span");
      el.className = "fig-tag";
      el.textContent = fig;
      slide.append(el);
    }

    const src = slide.dataset.src;
    if (src) {
      const el = document.createElement("span");
      el.className = "src-tag";
      const label = document.createElement("span");
      label.className = "src-tag__label";
      label.textContent = "Fuentes";
      el.append(label);
      src
        .trim()
        .split(/\s+/)
        .forEach((id) => {
          const badge = document.createElement("span");
          badge.className = "src-tag__id";
          badge.textContent = id;
          el.append(badge);
        });
      slide.append(el);
    }

    const pageno = document.createElement("span");
    pageno.className = "pageno";
    pageno.textContent = `${pad(i + 1)} / ${pad(total)}`;
    slide.append(pageno);

    const title = slide.dataset.title || slide.querySelector("h1")?.textContent?.trim() || `Slide ${i + 1}`;
    slide.dataset.title = title;
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label", `${i + 1} de ${total}. ${title}`);
  });

  totalEl.textContent = pad(total);

  /* ---------- Escalado del canvas ---------- */

  let resizeFrame = 0;
  function fit() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const reserve = window.innerWidth < 720 ? 62 : 74;
      const scale = Math.min(
        window.innerWidth / 1920,
        Math.max(0.1, (window.innerHeight - reserve) / 1080)
      );
      stage.style.setProperty("--scale", String(scale));
    });
  }

  window.addEventListener("resize", fit, { passive: true });
  window.addEventListener("orientationchange", fit, { passive: true });
  document.addEventListener("fullscreenchange", fit);

  /* ---------- Navegación ---------- */

  function updateOverviewCurrent() {
    document.querySelectorAll(".ov-card").forEach((card, i) => {
      const current = i === index;
      card.classList.toggle("is-current", current);
      if (current) card.setAttribute("aria-current", "true");
      else card.removeAttribute("aria-current");
    });
  }

  function refreshNotes() {
    const slide = slides[index];
    const notes = slide.querySelector(".notes");
    notesLabel.textContent = `Notas · slide ${pad(index + 1)}`;
    notesTitle.textContent = slide.dataset.title || "";
    notesBody.innerHTML = notes
      ? notes.innerHTML
      : "<p>Esta slide no tiene notas. Usa el espacio para explicar el diagrama con tus propias palabras.</p>";
  }

  function go(next, options = {}) {
    const target = clamp(next);
    if (target === index && !options.force) {
      updateOverviewCurrent();
      return;
    }

    const previous = slides[index];
    previous?.classList.remove("is-active");
    previous?.setAttribute("aria-hidden", "true");
    if (previous) previous.inert = true;

    index = target;
    const slide = slides[index];
    slide.classList.add("is-active");
    slide.removeAttribute("aria-hidden");
    slide.inert = false;

    counter.textContent = pad(index + 1);
    progress.style.width = `${((index + 1) / total) * 100}%`;
    live.textContent = `Slide ${index + 1} de ${total}: ${slide.dataset.title}`;
    document.title = `${pad(index + 1)} · ${slide.dataset.title} — MCP`;

    try {
      history.replaceState(null, "", `#/${index + 1}`);
    } catch {
      location.hash = `#/${index + 1}`;
    }

    updateOverviewCurrent();
    if (openPanel === "notes") refreshNotes();

    requestAnimationFrame(() => {
      document.dispatchEvent(
        new CustomEvent("slide:enter", {
          detail: { index, slide, first: Boolean(options.initial) },
        })
      );
    });
  }

  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  function fromHash() {
    const match = location.hash.match(/^#\/(\d{1,2})$/);
    return match ? clamp(Number(match[1]) - 1) : 0;
  }

  window.addEventListener("hashchange", () => {
    const target = fromHash();
    if (target !== index) go(target);
  });

  /* ---------- Tema ---------- */

  function setTheme(theme, persist = true) {
    root.dataset.theme = theme;
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "light" ? "#f7f5f0" : "#0a1017");
    }
    if (persist) {
      try {
        localStorage.setItem("mcp-deck-theme", theme);
      } catch {
        /* almacenamiento no disponible */
      }
    }
  }

  function toggleTheme() {
    setTheme(root.dataset.theme === "light" ? "dark" : "light");
  }

  /* ---------- Pantalla completa ---------- */

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* el navegador puede bloquearlo fuera de un gesto de usuario */
    }
  }

  /* ---------- Overlays ---------- */

  const overlays = {
    overview: document.getElementById("overview"),
    notes: document.getElementById("notes"),
    help: document.getElementById("help"),
  };

  Object.values(overlays).forEach((overlay) => {
    overlay.setAttribute("aria-hidden", "true");
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeOverlays();
    });
    overlay.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => closeOverlays());
    });
  });

  function openOverlay(name) {
    if (!overlays[name]) return;
    if (openPanel === name) {
      closeOverlays();
      return;
    }
    if (!openPanel) lastFocus = document.activeElement;
    Object.entries(overlays).forEach(([key, overlay]) => {
      const isOpen = key === name;
      overlay.classList.toggle("is-open", isOpen);
      overlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
    });
    openPanel = name;
    if (name === "notes") refreshNotes();
    const focusTarget =
      overlays[name].querySelector(".ov-card.is-current") ||
      overlays[name].querySelector("[data-close]") ||
      overlays[name].querySelector("button, a, [tabindex]");
    focusTarget?.focus({ preventScroll: true });
  }

  function closeOverlays(restoreFocus = true) {
    if (!openPanel) return;
    Object.values(overlays).forEach((overlay) => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    });
    openPanel = null;
    if (restoreFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  /* ---------- Vista general ---------- */

  const ovGrid = document.getElementById("ov-grid");
  slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ov-card";

    const num = document.createElement("span");
    num.className = "ov-card__num";
    num.textContent = `${pad(i + 1)} / ${pad(total)}`;

    const title = document.createElement("span");
    title.className = "ov-card__title";
    title.textContent = slide.dataset.title;

    const act = document.createElement("span");
    act.className = "ov-card__act";
    act.textContent = slide.dataset.act || "";

    button.append(num, title, act);
    button.addEventListener("click", () => {
      closeOverlays(false);
      go(i);
    });
    ovGrid.append(button);
  });

  /* ---------- Botones del chrome ---------- */

  document.getElementById("btn-prev")?.addEventListener("click", prev);
  document.getElementById("btn-next")?.addEventListener("click", next);
  document.getElementById("btn-overview")?.addEventListener("click", () => openOverlay("overview"));
  document.getElementById("btn-notes")?.addEventListener("click", () => openOverlay("notes"));
  document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);
  document.getElementById("btn-fullscreen")?.addEventListener("click", toggleFullscreen);
  document.getElementById("btn-help")?.addEventListener("click", () => openOverlay("help"));

  /* ---------- Saltos internos (agenda) ---------- */

  document.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-goto]");
    if (!jump) return;
    const target = Number(jump.dataset.goto);
    if (Number.isFinite(target)) {
      closeOverlays(false);
      go(target - 1);
    }
  });

  /* ---------- Teclado ---------- */

  const NAV_KEYS = new Set([
    "ArrowRight",
    "ArrowDown",
    "PageDown",
    " ",
    "Spacebar",
  ]);
  const PREV_KEYS = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const target = event.target;
    const interactive =
      target instanceof Element &&
      target.closest("input, textarea, select, [contenteditable='true']");
    if (interactive) return;

    const key = event.key;

    if (key === "Escape") {
      if (openPanel) {
        event.preventDefault();
        closeOverlays();
      }
      return;
    }

    if (key === "?" || (key === "/" && event.shiftKey)) {
      event.preventDefault();
      openOverlay("help");
      return;
    }

    if (key === "o" || key === "O") {
      event.preventDefault();
      openOverlay("overview");
      return;
    }

    if (key === "n" || key === "N") {
      event.preventDefault();
      openOverlay("notes");
      return;
    }

    if (key === "t" || key === "T") {
      event.preventDefault();
      toggleTheme();
      return;
    }

    if (key === "f" || key === "F") {
      event.preventDefault();
      toggleFullscreen();
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      if (openPanel === "overview") closeOverlays(false);
      go(0);
      return;
    }

    if (key === "End") {
      event.preventDefault();
      if (openPanel === "overview") closeOverlays(false);
      go(total - 1);
      return;
    }

    if (NAV_KEYS.has(key)) {
      if (
        event.target instanceof Element &&
        event.target.closest("button, a, [role='tab'], [role='button']") &&
        key === " "
      ) {
        return;
      }
      event.preventDefault();
      if (openPanel === "overview") closeOverlays(false);
      if (openPanel !== "help") next();
      return;
    }

    if (PREV_KEYS.has(key)) {
      event.preventDefault();
      if (openPanel === "overview") closeOverlays(false);
      if (openPanel !== "help") prev();
    }
  });

  /* ---------- Gesto táctil ---------- */

  let touchStart = null;
  deck.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" || openPanel) return;
      if (event.target.closest("button, a, .steps, .seg")) return;
      touchStart = { x: event.clientX, y: event.clientY, t: Date.now() };
    },
    { passive: true }
  );

  deck.addEventListener(
    "pointerup",
    (event) => {
      if (!touchStart || event.pointerType === "mouse") return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      const dt = Date.now() - touchStart.t;
      touchStart = null;
      if (dt > 700 || Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) {
        return;
      }
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  /* ---------- Resaltado de sintaxis ---------- */

  const escapeHTML = (text) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function dedent(text) {
    const clean = text.replace(/^\n+/, "").replace(/\s+$/, "");
    const lines = clean.split("\n");
    const indents = lines
      .filter((line) => line.trim())
      .map((line) => (line.match(/^[ \t]*/) || [""])[0].length);
    const min = indents.length ? Math.min(...indents) : 0;
    return lines.map((line) => line.slice(min)).join("\n");
  }

  function highlightJSON(source) {
    return source.replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (match, string, colon, bool, num) => {
        if (string) {
          const cls = colon ? "tok-key" : "tok-str";
          return `<span class="${cls}">${string}</span>${colon || ""}`;
        }
        if (bool) return `<span class="tok-bool">${bool}</span>`;
        if (num) return `<span class="tok-num">${num}</span>`;
        return match;
      }
    );
  }

  function highlightTS(source) {
    return source.replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(const|let|var|function|return|import|from|async|await|new|if|else|type|interface|true|false|null|undefined|throw|try|catch)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([A-Z][A-Za-z0-9_]*)\b/g,
      (match, comment, string, keyword, number, fn, type) => {
        if (comment) return `<span class="tok-com">${comment}</span>`;
        if (string) return `<span class="tok-str">${string}</span>`;
        if (keyword) {
          const cls = /^(true|false|null|undefined)$/.test(keyword)
            ? "tok-bool"
            : "tok-kw";
          return `<span class="${cls}">${keyword}</span>`;
        }
        if (number) return `<span class="tok-num">${number}</span>`;
        if (fn) return `<span class="tok-fn">${fn}</span>`;
        if (type) return `<span class="tok-type">${type}</span>`;
        return match;
      }
    );
  }

  document.querySelectorAll("pre code[data-lang]").forEach((code) => {
    const lang = code.dataset.lang;
    const raw = dedent(code.textContent);
    const safe = escapeHTML(raw);
    code.innerHTML =
      lang === "json" ? highlightJSON(safe) : lang === "ts" ? highlightTS(safe) : safe;
    code.classList.add("is-highlighted");
  });

  /* ---------- Arranque ---------- */

  const initial = fromHash();
  slides.forEach((slide, i) => {
    if (i !== initial) {
      slide.setAttribute("aria-hidden", "true");
      slide.inert = true;
    }
  });

  fit();
  go(initial, { force: true, initial: true });

  // API mínima para QA y automatización
  window.deck = {
    go: (n) => go(n - 1),
    next,
    prev,
    get index() {
      return index + 1;
    },
    get total() {
      return total;
    },
    overlay: openOverlay,
    close: closeOverlays,
  };
})();
