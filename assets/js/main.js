import { renderIcon } from "./icons.js";

const SECTION_ORDER = [
  "hero",
  "problem",
  "benefits",
  "products",
  "live",
  "companies",
  "reviews",
  "faq",
  "cta"
];

async function loadConfig() {
  if (window.__CONFIG_PROMISE__) {
    return window.__CONFIG_PROMISE__;
  }
  const response = await fetch("config.json");
  if (!response.ok) throw new Error("Failed to load config.json");
  return response.json();
}

function resolveLink(link, contacts, customMessage) {
  if (!link) return "#";
  if (link.startsWith("http") || link.startsWith("mailto:")) return link;
  const contactUrl = contacts[link];
  if (!contactUrl) return "#";
  if (link === "whatsapp") {
    const message = encodeURIComponent(customMessage || contacts.whatsappMessage || "");
    const separator = contactUrl.includes("?") ? "&" : "?";
    return `${contactUrl}${separator}text=${message}`;
  }
  return contactUrl;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ["#6D28D9", "#1D4ED8", "#0E7490", "#047857", "#92400E", "#B91C1C"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function renderImage(src, alt, className, fallbackHtml) {
  if (src) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" loading="lazy">`;
  }
  return fallbackHtml || "";
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--accent-from", theme.accentFrom || "#8B5CF6");
  root.style.setProperty("--accent-to", theme.accentTo || "#3B82F6");
  root.style.setProperty("--bg", theme.background || "#08080C");
}

function upsertMeta(selector, attributes) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(rel, href) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

function resolveAbsoluteUrl(path, siteUrl) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = (siteUrl || "").replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

function applyMeta(meta, brand) {
  const title = meta.pageTitle || brand.name;
  const description = meta.description || "";
  const siteUrl = meta.siteUrl || "";

  document.documentElement.lang = meta.lang || "pt-BR";
  document.title = title;

  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow" });

  if (siteUrl) {
    upsertLink("canonical", siteUrl);
  }

  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: meta.ogType || "website" });
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: (meta.lang || "pt-BR").replace("-", "_") });

  if (siteUrl) {
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: siteUrl });
  }

  if (meta.ogImage) {
    const imageUrl = resolveAbsoluteUrl(meta.ogImage, siteUrl);
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  }

  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: meta.twitterCard || "summary" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

  if (meta.favicon && !document.querySelector('link[rel="icon"][href^="data:"]')) {
    upsertLink("icon", meta.favicon);
    const iconLink = document.querySelector('link[rel="icon"]');
    if (iconLink) iconLink.type = "image/svg+xml";
  }
}

function buildStructuredData(config) {
  const meta = config.meta || {};
  const brand = config.brand || {};
  const siteUrl = meta.siteUrl || "";
  const graphs = [];

  graphs.push({
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    url: siteUrl,
    name: brand.name,
    description: meta.description,
    inLanguage: meta.lang || "pt-BR"
  });

  graphs.push({
    "@type": "Person",
    "@id": `${siteUrl}#person`,
    name: brand.name,
    url: siteUrl,
    description: meta.description
  });

  if (config.faq?.items?.length) {
    graphs.push({
      "@type": "FAQPage",
      "@id": `${siteUrl}#faq`,
      mainEntity: config.faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graphs
  };
}

function applyStructuredData(config) {
  const scriptId = "structured-data";
  const existing = document.getElementById(scriptId);
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(buildStructuredData(config));
  document.head.appendChild(script);
}

function renderNav(nav, brand, contacts) {
  const logoHtml = brand.logo
    ? renderImage(brand.logo, brand.logoAlt, "nav__logo-img", "")
    : `<span class="nav__logo-text">${escapeHtml(brand.name)}</span>`;

  const items = (nav.items || []).map((item) =>
    `<a href="${escapeHtml(item.anchor)}" class="nav__link">${escapeHtml(item.label)}</a>`
  ).join("");

  const cta = nav.cta
    ? `<a href="${resolveLink(nav.cta.link, contacts)}" class="btn btn--primary btn--sm nav__cta" target="_blank" rel="noopener">${escapeHtml(nav.cta.text)}</a>`
    : "";

  return `
    <header class="nav" id="nav">
      <div class="container nav__inner">
        <a href="#" class="nav__brand">${logoHtml}</a>
        <nav class="nav__menu" id="nav-menu" aria-label="Menu principal">${items}</nav>
        <div class="nav__actions">
          ${cta}
          <button class="nav__toggle" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">
            ${renderIcon("menu")}
          </button>
        </div>
      </div>
    </header>`;
}

function renderHero(hero, contacts) {
  const badges = (hero.badges || []).map((b) =>
    `<span class="badge">${renderIcon("sparkles", "badge__icon")}${escapeHtml(b)}</span>`
  ).join("");

  const primaryCta = hero.cta?.primary;
  const secondaryCta = hero.cta?.secondary;

  const heroVisual = hero.image
    ? renderImage(hero.image, hero.highlight, "hero__image", "")
    : `<div class="hero__visual-placeholder">
        <div class="hero__glow"></div>
        <div class="hero__card-preview glass">
          ${renderIcon("code", "hero__preview-icon")}
          <span>Java + IA</span>
        </div>
      </div>`;

  return `
    <section class="section hero" id="hero">
      <div class="container hero__grid">
        <div class="hero__content reveal">
          <div class="hero__badges">${badges}</div>
          <h1 class="hero__title">
            ${escapeHtml(hero.title)}
            <span class="gradient-text">${escapeHtml(hero.highlight)}</span>
          </h1>
          <p class="hero__subtitle">${escapeHtml(hero.subtitle)}</p>
          <div class="hero__actions">
            ${primaryCta ? `<a href="${resolveLink(primaryCta.link, contacts)}" class="btn btn--primary" target="_blank" rel="noopener">${escapeHtml(primaryCta.text)}</a>` : ""}
            ${secondaryCta ? `<a href="${escapeHtml(secondaryCta.anchor || "#")}" class="btn btn--ghost">${escapeHtml(secondaryCta.text)}</a>` : ""}
          </div>
        </div>
        <div class="hero__visual reveal">${heroVisual}</div>
      </div>
    </section>`;
}

function renderProblem(problem) {
  const pains = (problem.pains || []).map((p) => `
    <div class="card card--pain glass reveal">
      <div class="card__icon card__icon--danger">${renderIcon(p.icon)}</div>
      <h3 class="card__title">${escapeHtml(p.title)}</h3>
      <p class="card__text">${escapeHtml(p.text)}</p>
    </div>`).join("");

  const solutions = (problem.solutions || []).map((s) => `
    <div class="card card--solution glass reveal">
      <div class="card__icon card__icon--accent">${renderIcon(s.icon)}</div>
      <h3 class="card__title">${escapeHtml(s.title)}</h3>
      <p class="card__text">${escapeHtml(s.text)}</p>
    </div>`).join("");

  return `
    <section class="section problem">
      <div class="container">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(problem.title)}</h2>
          <p class="section__subtitle">${escapeHtml(problem.subtitle)}</p>
        </div>
        <div class="problem__grid">
          <div class="problem__col">
            <h3 class="problem__label">O problema</h3>
            <div class="cards-grid cards-grid--3">${pains}</div>
          </div>
          <div class="problem__col">
            <h3 class="problem__label problem__label--accent">A solução</h3>
            <div class="cards-grid cards-grid--3">${solutions}</div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderBenefits(benefits) {
  const items = (benefits.items || []).map((item) => `
    <div class="card glass reveal">
      <div class="card__icon card__icon--accent">${renderIcon(item.icon)}</div>
      <h3 class="card__title">${escapeHtml(item.title)}</h3>
      <p class="card__text">${escapeHtml(item.description)}</p>
      ${item.image ? renderImage(item.image, item.title, "card__image", "") : ""}
    </div>`).join("");

  return `
    <section class="section benefits" id="${escapeHtml(benefits.id || "benefits")}">
      <div class="container">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(benefits.title)}</h2>
          <p class="section__subtitle">${escapeHtml(benefits.subtitle)}</p>
        </div>
        <div class="cards-grid cards-grid--3">${items}</div>
      </div>
    </section>`;
}

function renderProducts(products, contacts) {
  const slides = (products.items || []).map((item) => {
    const features = (item.features || []).map((f) =>
      `<li class="product-card__feature">${renderIcon("check", "product-card__check")}${escapeHtml(f)}</li>`
    ).join("");

    const cta = item.cta || {};
    const ctaHref = resolveLink(cta.link, contacts, cta.whatsappMessage);

    return `
      <div class="carousel__slide">
        <article class="product-card glass${item.highlighted ? " product-card--highlighted" : ""}">
          ${item.badge ? `<span class="product-card__badge">${escapeHtml(item.badge)}</span>` : ""}
          ${item.image
            ? renderImage(item.image, item.name, "product-card__image", "")
            : `<div class="product-card__image-placeholder">${renderIcon("sparkles")}</div>`}
          <div class="product-card__body">
            <h3 class="product-card__name">${escapeHtml(item.name)}</h3>
            <p class="product-card__description">${escapeHtml(item.description)}</p>
            <p class="product-card__price">${escapeHtml(item.price)}</p>
            <ul class="product-card__features">${features}</ul>
            <a href="${ctaHref}" class="btn btn--primary btn--full" target="_blank" rel="noopener">${escapeHtml(cta.text || "Saiba mais")}</a>
          </div>
        </article>
      </div>`;
  }).join("");

  const carousel = products.carousel || {};

  return `
    <section class="section products" id="${escapeHtml(products.id || "products")}">
      <div class="container">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(products.title)}</h2>
          <p class="section__subtitle">${escapeHtml(products.subtitle)}</p>
        </div>
        <div class="carousel" data-carousel data-autoplay="${carousel.autoplay}" data-interval="${carousel.interval}" data-arrows="${carousel.showArrows}" data-dots="${carousel.showDots}">
          <button class="carousel__arrow carousel__arrow--prev" aria-label="Anterior">${renderIcon("chevron-left")}</button>
          <div class="carousel__track">${slides}</div>
          <button class="carousel__arrow carousel__arrow--next" aria-label="Próximo">${renderIcon("chevron-right")}</button>
          <div class="carousel__dots" role="tablist"></div>
        </div>
      </div>
    </section>`;
}

function renderLive(live) {
  const topics = (live.topics || []).map((t) => `
    <div class="live-card glass reveal">
      <div class="live-card__icon">${renderIcon(t.icon)}</div>
      <div class="live-card__content">
        <h3 class="live-card__title">${escapeHtml(t.title)}</h3>
        <p class="live-card__text">${escapeHtml(t.description)}</p>
      </div>
    </div>`).join("");

  return `
    <section class="section live" id="${escapeHtml(live.id || "live")}">
      <div class="container">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(live.title)}</h2>
          <p class="section__subtitle">${escapeHtml(live.subtitle)}</p>
          ${live.schedule ? `<p class="live__schedule">${renderIcon("video", "live__schedule-icon")}${escapeHtml(live.schedule)}</p>` : ""}
        </div>
        <div class="live__grid">${topics}</div>
      </div>
    </section>`;
}

function renderCompanies(companies) {
  const items = (companies.items || []).map((c) => {
    if (c.logo) {
      return `<div class="company-item reveal">${renderImage(c.logo, c.name, "company-item__logo", "")}</div>`;
    }
    return `<div class="company-item company-item--text reveal">${escapeHtml(c.name)}</div>`;
  }).join("");

  return `
    <section class="section companies">
      <div class="container">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(companies.title)}</h2>
          <p class="section__subtitle">${escapeHtml(companies.subtitle)}</p>
        </div>
        <div class="companies__grid">${items}</div>
        <p class="companies__impact gradient-text reveal">${escapeHtml(companies.impactPhrase)}</p>
        ${companies.disclaimer ? `<p class="companies__disclaimer reveal">${escapeHtml(companies.disclaimer)}</p>` : ""}
      </div>
    </section>`;
}

function renderReviews(reviews) {
  const items = reviews.items || [];
  const avg = items.length
    ? (items.reduce((sum, r) => sum + (r.rating || 5), 0) / items.length).toFixed(1)
    : "5.0";

  const summary = reviews.showRatingSummary && items.length
    ? `<div class="reviews__summary reveal">
        <div class="reviews__stars">${renderStars(5)}</div>
        <span class="reviews__avg">${avg}/5</span>
        <span class="reviews__count">· ${items.length} avaliações</span>
      </div>`
    : "";

  const cards = items.map((r) => {
    const avatar = r.avatar
      ? renderImage(r.avatar, r.name, "review-card__avatar", "")
      : `<div class="review-card__avatar review-card__avatar--initial" style="background:${getAvatarColor(r.name)}">${getInitials(r.name)}</div>`;

    return `
      <article class="review-card glass reveal">
        <div class="review-card__quote">${renderIcon("quote")}</div>
        <div class="review-card__stars">${renderStars(r.rating || 5)}</div>
        <p class="review-card__text">"${escapeHtml(r.text)}"</p>
        <div class="review-card__author">
          ${avatar}
          <div>
            <p class="review-card__name">${escapeHtml(r.name)}</p>
            <p class="review-card__role">${escapeHtml(r.role)} @ ${escapeHtml(r.company)}</p>
          </div>
        </div>
      </article>`;
  }).join("");

  return `
    <section class="section reviews" id="${escapeHtml(reviews.id || "reviews")}">
      <div class="container">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(reviews.title)}</h2>
          <p class="section__subtitle">${escapeHtml(reviews.subtitle)}</p>
        </div>
        ${summary}
        <div class="reviews__grid">${cards}</div>
      </div>
    </section>`;
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="star${i < rating ? " star--filled" : ""}">${renderIcon("star")}</span>`
  ).join("");
}

function renderFaq(faq) {
  const items = (faq.items || []).map((item, i) => `
    <details class="faq-item glass reveal" ${i === 0 ? "open" : ""}>
      <summary class="faq-item__question">
        <span>${escapeHtml(item.question)}</span>
        <span class="faq-item__icon" aria-hidden="true"></span>
      </summary>
      <div class="faq-item__answer">
        <p>${escapeHtml(item.answer)}</p>
      </div>
    </details>`).join("");

  return `
    <section class="section faq" id="${escapeHtml(faq.id || "faq")}">
      <div class="container container--narrow">
        <div class="section__header reveal">
          <h2 class="section__title">${escapeHtml(faq.title)}</h2>
          <p class="section__subtitle">${escapeHtml(faq.subtitle)}</p>
        </div>
        <div class="faq__list">${items}</div>
      </div>
    </section>`;
}

function renderCta(cta, contacts) {
  const bullets = (cta.bullets || []).map((b) =>
    `<li class="cta__bullet">${renderIcon("check", "cta__check")}${escapeHtml(b)}</li>`
  ).join("");

  return `
    <section class="section cta-section">
      <div class="container">
        <div class="cta-box glass reveal">
          <h2 class="cta-box__title">${escapeHtml(cta.title)}</h2>
          <p class="cta-box__subtitle">${escapeHtml(cta.subtitle)}</p>
          <ul class="cta__bullets">${bullets}</ul>
          <a href="${resolveLink(cta.link, contacts)}" class="btn btn--primary btn--lg" target="_blank" rel="noopener">${escapeHtml(cta.buttonText)}</a>
          ${cta.urgencyText ? `<p class="cta-box__urgency">${escapeHtml(cta.urgencyText)}</p>` : ""}
        </div>
      </div>
    </section>`;
}

function renderFooter(footer, brand, contacts) {
  const social = (footer.social || []).map((s) =>
    `<a href="${resolveLink(s.link, contacts)}" class="footer__social-link" target="_blank" rel="noopener" aria-label="${escapeHtml(s.label)}">
      ${renderIcon(s.icon)}
      <span>${escapeHtml(s.label)}</span>
    </a>`
  ).join("");

  return `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <p class="footer__name">${escapeHtml(brand.name)}</p>
          <p class="footer__tagline">${escapeHtml(footer.tagline)}</p>
        </div>
        <div class="footer__social">${social}</div>
        <p class="footer__copyright">${escapeHtml(footer.copyright)}</p>
      </div>
    </footer>`;
}

const RENDERERS = {
  hero: (config) => renderHero(config.hero, config.contacts),
  problem: (config) => renderProblem(config.problem),
  benefits: (config) => renderBenefits(config.benefits),
  products: (config) => renderProducts(config.products, config.contacts),
  live: (config) => renderLive(config.live),
  companies: (config) => renderCompanies(config.companies),
  reviews: (config) => renderReviews(config.reviews),
  faq: (config) => renderFaq(config.faq),
  cta: (config) => renderCta(config.cta, config.contacts)
};

function isSectionEnabled(config, key) {
  const section = config[key];
  return section && section.enabled !== false;
}

function renderSections(config, skipHero = false) {
  const order = skipHero ? SECTION_ORDER.filter((key) => key !== "hero") : SECTION_ORDER;

  return order
    .filter((key) => isSectionEnabled(config, key))
    .map((key) => RENDERERS[key](config))
    .join("");
}

function renderPage(config) {
  return `
    ${renderNav(config.nav, config.brand, config.contacts)}
    <main>${renderSections(config)}</main>
    ${renderFooter(config.footer, config.brand, config.contacts)}`;
}

function updateNavFromConfig(config) {
  const nav = config.nav || {};
  const contacts = config.contacts || {};
  const brand = config.brand || {};

  const brandEl = document.querySelector(".nav__brand");
  if (brandEl && brand.name) {
    brandEl.innerHTML = brand.logo
      ? renderImage(brand.logo, brand.logoAlt, "nav__logo-img", "")
      : `<span class="nav__logo-text">${escapeHtml(brand.name)}</span>`;
  }

  const cta = document.querySelector(".nav__cta");
  if (cta && nav.cta) {
    cta.href = resolveLink(nav.cta.link, contacts);
    cta.textContent = nav.cta.text;
  }
}

function hydratePage(config) {
  const app = document.getElementById("app");
  const mainEl = document.getElementById("main-content");

  if (!mainEl) {
    app.innerHTML = renderPage(config);
    return;
  }

  const skipHero = Boolean(document.getElementById("hero"));
  mainEl.insertAdjacentHTML("beforeend", renderSections(config, skipHero));
  app.insertAdjacentHTML("beforeend", renderFooter(config.footer, config.brand, config.contacts));
  updateNavFromConfig(config);
}

function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("nav__menu--open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.innerHTML = isOpen ? renderIcon("x") : renderIcon("menu");
  });

  menu.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("nav__menu--open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = renderIcon("menu");
    });
  });

  window.addEventListener("scroll", () => {
    const nav = document.getElementById("nav");
    if (nav) nav.classList.toggle("nav--scrolled", window.scrollY > 20);
  }, { passive: true });
}

function initReveal() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const elements = document.querySelectorAll(".reveal");

  if (prefersReduced) {
    elements.forEach((el) => el.classList.add("reveal--visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  elements.forEach((el) => observer.observe(el));
}

async function initCarousels() {
  const containers = document.querySelectorAll("[data-carousel]");
  if (!containers.length) return;

  const { initCarousel } = await import("./carousel.js");
  containers.forEach((container) => {
    initCarousel(container, {
      autoplay: container.dataset.autoplay === "true",
      interval: parseInt(container.dataset.interval, 10) || 5000,
      showArrows: container.dataset.arrows === "true",
      showDots: container.dataset.dots === "true"
    });
  });
}

async function main() {
  try {
    const config = await loadConfig();
    applyTheme(config.theme || {});
    applyMeta(config.meta || {}, config.brand || {});
    applyStructuredData(config);

    hydratePage(config);

    initNav();
    initReveal();
    await initCarousels();
  } catch (error) {
    console.error(error);
    document.getElementById("app").innerHTML = `
      <div class="error">
        <h1>Erro ao carregar a página</h1>
        <p>Verifique se o config.json está acessível.</p>
      </div>`;
  }
}

main();
