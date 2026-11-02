/* ============================================================
   diagrams.js — interacciones de las slides 05, 06, 17 y 22
   ============================================================ */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const counters = new WeakMap();

  function onSlide(number, callback) {
    document.addEventListener("slide:enter", (event) => {
      if (event.detail.index === number - 1) callback(event.detail.slide);
    });
  }

  function animateNumber(element, target, duration = 720) {
    if (!element) return;
    const token = Symbol("counter");
    counters.set(element, token);
    const from = Number(element.textContent.replace(/[^\d-]/g, "")) || 0;
    if (reduced.matches || duration === 0) {
      element.textContent = String(target);
      return;
    }
    const started = performance.now();
    function tick(now) {
      if (counters.get(element) !== token) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Slide 05: el muro N×M ---------- */

  onSlide(5, (slide) => {
    animateNumber(slide.querySelector("[data-wall-count]"), 16, 1100);
  });

  /* ---------- Slide 06: la jugada de MCP ---------- */

  const s06 = document.querySelector(".s06");
  if (s06) {
    const counter = s06.querySelector("[data-wall-count]");
    const button = s06.querySelector("[data-solve]");
    let solved = false;
    let initialized = false;

    function setSolved(value, duration = 620) {
      solved = value;
      s06.classList.toggle("is-solved", value);
      button?.setAttribute("aria-pressed", String(value));
      if (button) {
        button.textContent = value ? "Quitar el protocolo" : "Insertar el protocolo";
      }
      animateNumber(counter, value ? 8 : 16, duration);
    }

    button?.addEventListener("click", () => setSolved(!solved));

    onSlide(6, () => {
      if (!initialized) {
        initialized = true;
        setSolved(false, 0);
      }
    });
  }

  /* ---------- Slide 17: una llamada, paso a paso ---------- */

  const stepper = document.querySelector(".s17");
  if (stepper) {
    const tabs = Array.from(stepper.querySelectorAll("[role='tab']"));
    const panels = Array.from(stepper.querySelectorAll("[role='tabpanel']"));
    const actors = Array.from(stepper.querySelectorAll("[data-actor]"));
    const pulse = stepper.querySelector("[data-pulse]");
    const payloadLabel = stepper.querySelector("[data-payload-label]");
    const payloadNote = stepper.querySelector("[data-payload-note]");

    const config = [
      { actors: [1, 2, 3], pulse: 2, label: "server/discover", note: "request + response" },
      { actors: [2, 3], pulse: 3, label: "tools/list", note: "request + response" },
      { actors: [0, 1], pulse: 1, label: "el modelo decide", note: "dentro del host · no es MCP" },
      { actors: [2, 3, 4], pulse: 3, label: "tools/call", note: "request" },
      { actors: [2, 3, 4], pulse: 2, label: "tools/call", note: "response" },
      { actors: [0, 1], pulse: 1, label: "respuesta final", note: "dentro del host · no es MCP" },
    ];

    function setStep(nextIndex, focus = false) {
      const index = Math.max(0, Math.min(tabs.length - 1, nextIndex));
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus({ preventScroll: true });
      });
      panels.forEach((panel, i) => {
        const selected = i === index;
        panel.classList.toggle("is-active", selected);
        panel.hidden = !selected;
        panel.setAttribute("aria-hidden", String(!selected));
      });
      actors.forEach((actor, i) => {
        actor.classList.toggle("is-active", config[index].actors.includes(i));
      });
      if (pulse) {
        pulse.style.left = `${10 + config[index].pulse * 20}%`;
      }
      if (payloadLabel) payloadLabel.textContent = config[index].label;
      if (payloadNote) payloadNote.textContent = config[index].note;
      stepper.dataset.step = String(index + 1);
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => setStep(i));
      tab.addEventListener("keydown", (event) => {
        const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        let target = i;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") target = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") target = 0;
        if (event.key === "End") target = tabs.length - 1;
        setStep(target, true);
      });
    });

    onSlide(17, () => setStep(0));

    // Estado final para impresión: deja el último paso visible
    window.addEventListener("beforeprint", () => setStep(tabs.length - 1));
  }

  /* ---------- Slide 22: árbol de decisión ---------- */

  const tree = document.querySelector(".s22");
  if (tree) {
    const verdict = tree.querySelector("[data-verdict]");
    const state = { scale: true, discovery: true };

    const verdicts = {
      "true-true":
        "MCP encaja: tienes un problema N×M y quieres descubrimiento en runtime. El coste del protocolo se paga solo.",
      "true-false":
        "Empieza por una API interna bien diseñada. MCP añade valor cuando aparezca un segundo host o un tercer sistema.",
      "false-true":
        "MCP puede aportar descubrimiento, pero con una sola app el coste de integración es bajo. Mide antes de añadir la capa.",
      "false-false":
        "No lo necesitas. Una integración directa entre tu app y tu API es más simple y más barata.",
    };

    function render() {
      tree.querySelectorAll("[data-q]").forEach((group) => {
        const key = group.dataset.q;
        group.querySelectorAll("button").forEach((button) => {
          const active = String(state[key]) === button.dataset.value;
          button.setAttribute("aria-pressed", String(active));
        });
      });
      if (verdict) {
        verdict.textContent = verdicts[`${state.scale}-${state.discovery}`];
        const box = verdict.closest(".tree__verdict");
        if (box) {
          box.dataset.state = state.scale && state.discovery ? "yes" : state.scale || state.discovery ? "maybe" : "no";
        }
      }
    }

    tree.querySelectorAll("[data-q]").forEach((group) => {
      group.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-value]");
        if (!button) return;
        state[group.dataset.q] = button.dataset.value === "true";
        render();
      });
    });

    render();
  }

  /* ---------- Impresión: estado final de los contadores ---------- */

  window.addEventListener("beforeprint", () => {
    const wall = document.querySelector(".s05 [data-wall-count]");
    if (wall) wall.textContent = "16";
    if (s06) {
      s06.classList.add("is-solved");
      const count = s06.querySelector("[data-wall-count]");
      if (count) count.textContent = "8";
    }
  });
})();
