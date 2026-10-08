const FAVICON_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' role='img' aria-label='Slides'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23b352ff'/%3E%3Cstop offset='100%25' stop-color='%23f062ff'/%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='1.2' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='%230d0115'/%3E%3Crect x='6' y='7' width='20' height='15' rx='2.5' fill='none' stroke='url(%23g)' stroke-width='2' filter='url(%23glow)'/%3E%3Crect x='9' y='10' width='14' height='2' rx='1' fill='url(%23g)'/%3E%3Crect x='9' y='14' width='10' height='1.5' rx='.75' fill='%23c9b8e8' opacity='.9'/%3E%3Crect x='9' y='17' width='12' height='1.5' rx='.75' fill='%23c9b8e8' opacity='.65'/%3E%3Cpolygon points='22,22 22,26 26,24' fill='url(%23g)'/%3E%3C/svg%3E";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function htmlFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}

function renderBadge(slide) {
  if (!slide.badge) return "";
  const challenge = slide.modifiers?.includes("challenge");
  const cls = challenge ? "badge badge--challenge" : "badge";
  return `<span class="${cls}">${slide.badge}</span>`;
}

function renderMiniCards(cards) {
  return (cards || [])
    .map(
      (card) =>
        `<div class="mini-card"><h3>${card.title}</h3><p>${card.text}</p></div>`
    )
    .join("");
}

function renderListItems(items) {
  if (!items?.length) return "";
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderLinkCard(link, style = "") {
  if (!link) return "";
  const styleAttr = style ? ` style="${style}"` : "";
  return `<a class="link-card"${styleAttr} href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">
    <span>${link.label}</span>
    <strong>${link.text}</strong>
  </a>`;
}

function renderSlide(slide, index) {
  const mods = slide.modifiers || [];
  const classes = ["slide", ...mods.map((m) => `slide--${m}`)];
  if (index === 0) classes.push("is-active");

  let inner = "";

  switch (slide.type) {
    case "cover":
      inner = `
        <div class="cover-grid">
          <div>
            ${renderBadge(slide)}
            <h1>${escapeHtml(slide.title || "")}${
        slide.titleScript
          ? ` <span class="script">${escapeHtml(slide.titleScript)}</span>`
          : ""
      }</h1>
            ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}
            ${slide.meta ? `<p class="meta">${escapeHtml(slide.meta)}</p>` : ""}
          </div>
          ${
            slide.image
              ? `<img src="${escapeHtml(slide.image.src)}" alt="${escapeHtml(slide.image.alt || "")}">`
              : ""
          }
        </div>`;
      break;

    case "section":
      inner = `
        ${renderBadge(slide)}
        ${slide.sectionNum ? `<div class="section-num">${escapeHtml(slide.sectionNum)}</div>` : ""}
        <h2>${escapeHtml(slide.title || "")}</h2>
        ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}`;
      break;

    case "grid":
      inner = `
        ${renderBadge(slide)}
        <h2>${escapeHtml(slide.title || "")}</h2>
        <div class="grid-2">${renderMiniCards(slide.cards)}</div>`;
      break;

    case "links":
      inner = `
        ${renderBadge(slide)}
        <h2>${escapeHtml(slide.title || "")}</h2>
        ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}
        <div class="link-grid">${(slide.links || []).map((l) => renderLinkCard(l)).join("")}</div>
        ${slide.footerMeta ? `<p class="meta" style="margin-top: 1.5rem;">${escapeHtml(slide.footerMeta)}</p>` : ""}`;
      break;

    case "open":
      inner = `
        ${renderBadge(slide)}
        <h2>${escapeHtml(slide.title || "")}</h2>
        <div class="card">
          ${slide.prompt ? `<p class="open-prompt">${slide.prompt}</p>` : ""}
          ${renderListItems(slide.items)}
        </div>`;
      break;

    case "card":
    default:
      inner = `
        ${renderBadge(slide)}
        <h2>${escapeHtml(slide.title || "")}</h2>
        <div class="card">
          ${slide.intro ? `<p class="subtitle" style="margin-top: 0;">${slide.intro}</p>` : ""}
          ${slide.cards ? `<div class="grid-2">${renderMiniCards(slide.cards)}</div>` : ""}
          ${renderListItems(slide.items)}
          ${slide.link ? renderLinkCard(slide.link, "style=\"margin-top: 1.25rem;\"") : ""}
          ${slide.quote ? `<p class="quote">${slide.quote}</p>` : ""}
        </div>`;
      break;
  }

  return `<section class="${classes.join(" ")}" data-slide="${slide.order ?? index + 1}">${inner}</section>`;
}

function initNavigation(deck, meta) {
  const slides = Array.from(deck.querySelectorAll(".slide"));
  const total = slides.length;
  let index = 0;

  const counterEl = document.getElementById("counter");
  const progressEl = document.getElementById("progress");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const prefix = meta.slideTitlePrefix || "Slide";

  function show(i) {
    index = Math.max(0, Math.min(total - 1, i));
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === index);
    });
    counterEl.textContent = `${index + 1} / ${total}`;
    progressEl.style.width = `${((index + 1) / total) * 100}%`;
    document.title = `${prefix} ${index + 1} — ${meta.shortTitle || meta.title}`;
  }

  function next() {
    show(index + 1);
  }

  function prev() {
    show(index - 1);
  }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    }
    if (e.key === "Home") {
      e.preventDefault();
      show(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      show(total - 1);
    }
    if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    }
  });

  let touchStartX = 0;
  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  document.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) next();
        else prev();
      }
    },
    { passive: true }
  );

  show(0);
}

async function loadDeckConfig() {
  const url =
    window.SLIDES_CONFIG_URL ||
    document.documentElement.getAttribute("data-slides-config");
  if (!url) {
    throw new Error("Defina window.SLIDES_CONFIG_URL ou data-slides-config no <html>.");
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url}`);
  }
  return response.json();
}

function applyMeta(meta) {
  if (meta.lang) {
    document.documentElement.lang = meta.lang;
  }
  if (meta.title) {
    document.title = meta.title;
  }
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = meta.favicon || FAVICON_SVG;
  link.type = "image/svg+xml";
}

export async function mountSlidesDeck() {
  const deck = document.getElementById("deck");
  if (!deck) return;

  const config = await loadDeckConfig();
  const meta = config.meta || {};
  applyMeta(meta);

  const html = (config.slides || []).map((slide, i) => renderSlide(slide, i)).join("");
  deck.innerHTML = html;
  initNavigation(deck, meta);
}

mountSlidesDeck().catch((err) => {
  const deck = document.getElementById("deck");
  if (deck) {
    deck.innerHTML = `<p class="meta" style="padding:2rem;color:#f88;">${escapeHtml(err.message)}</p>`;
  }
  console.error(err);
});
