const {
  esc,
  groupHref,
  loadPortfolio,
  projectCard,
  projectHref,
  setupChrome,
  setupReveal
} = window.PortfolioUI;

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SLIDE_MS = 5200;
const DESK_FEATURE_PROJECTS = {
  curation: "hat-boi-saigon-art-cruise",
  copywriting: "toong-global-city",
  publishing: "hormones-ebook",
  interviews: "hidden-champions",
  "board-game": "cuoc-dua-dau-thai"
};
const REJECTED_VISUAL_NAMES = /(screen\s*shot|screenshot|screen\s*cap|capture|chụp màn|chup man|cap màn|cap man|proposal|brief|factsheet|fact sheet|mockup|avatar|social copy|mặt trước|mat truoc|mặt sau|mat sau|logo|brochure|\.pdf|\.pptx?|\.docx?)/i;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isPhotoMedia(item) {
  if (item.type !== "image" || !item.thumbnail || REJECTED_VISUAL_NAMES.test(item.title || "")) return false;
  const mime = item.mime || "";
  return /^image\/(jpeg|jpg|webp)$/i.test(mime) || /\.(jpe?g|webp)$/i.test(item.title || "");
}

function curatedVisuals(project, limit = 3) {
  const photos = [...new Set((project.media || []).filter(isPhotoMedia).map(item => item.thumbnail))];
  if (photos.length) return shuffle(photos).slice(0, limit);

  const cover = project.cover || "";
  const safeLocalCover = cover.startsWith("media/") && !/(logo|screenshot|screen)/i.test(cover);
  const safeBoardImage = project.id === "cuoc-dua-dau-thai" && cover;
  return safeLocalCover || safeBoardImage ? [cover] : [];
}

function featureProject(group, projects) {
  const preferred = projects.find(project => project.id === DESK_FEATURE_PROJECTS[group.id]);
  if (preferred && curatedVisuals(preferred).length) return preferred;

  const lead = projects.find(project => project.id === group.leadProject);
  if (lead && curatedVisuals(lead).length) return lead;

  return projects
    .filter(project => project.group === group.id && project.published !== false)
    .map(project => ({ project, score: curatedVisuals(project).length }))
    .sort((a, b) => b.score - a.score)[0]?.project;
}

function chooseLandingFeatures(groups, projects) {
  return shuffle(groups)
    .map(group => ({ group, project: featureProject(group, projects) }))
    .filter(item => item.project && curatedVisuals(item.project).length)
    .slice(0, 3);
}

function slideshowMarkup(project, options = {}) {
  const { eager = false, label = project.title } = options;
  const visuals = curatedVisuals(project);
  return `
    <span class="media-slideshow" data-media-slideshow data-fallback-label="${esc(label)}" data-slide-count="${visuals.length}">
      ${visuals.map((visual, index) => `
        <img class="media-slide${index === 0 ? " is-active" : ""}" src="${esc(visual)}"
          alt="${esc(project.imageAlt || project.title)}" loading="${eager || index === 0 ? "eager" : "lazy"}" decoding="async">`).join("")}
      ${visuals.length > 1 ? `<span class="media-slideshow__dots" aria-hidden="true">${visuals.map((_, index) => `<i class="${index === 0 ? "is-active" : ""}"></i>`).join("")}</span>` : ""}
    </span>`;
}

function setupMediaSlides() {
  document.querySelectorAll("[data-media-slideshow]").forEach((stage, stageIndex) => {
    let current = 0;
    let paused = false;
    const host = stage.closest("a, article") || stage;

    const usableSlides = () => [...stage.querySelectorAll(".media-slide")];
    const show = nextIndex => {
      const slides = usableSlides();
      if (!slides.length) {
        stage.classList.add("is-empty");
        return;
      }
      current = ((nextIndex % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, index) => slide.classList.toggle("is-active", index === current));
      stage.querySelectorAll(".media-slideshow__dots i").forEach((dot, index) => dot.classList.toggle("is-active", index === current));
    };

    usableSlides().forEach(slide => slide.addEventListener("error", () => {
      const wasActive = slide.classList.contains("is-active");
      slide.remove();
      if (wasActive || !usableSlides().some(item => item.classList.contains("is-active"))) show(current);
    }, { once: true }));

    host.addEventListener("mouseenter", () => { paused = true; });
    host.addEventListener("mouseleave", () => { paused = false; });
    host.addEventListener("focusin", () => { paused = true; });
    host.addEventListener("focusout", () => { paused = false; });

    if (reducedMotion || usableSlides().length < 2) return;
    setTimeout(() => {
      show(current + 1);
      setInterval(() => {
        if (!paused && !document.hidden) show(current + 1);
      }, SLIDE_MS);
    }, SLIDE_MS + (stageIndex % 3) * 520);
  });
}

function featureLabel(project, group) {
  return `${group.short} / ${project.editorialLabel || project.role || "Selected project"}`;
}

function heroFeatureCard(feature, index) {
  const { project, group } = feature;
  return `
    <a class="hero-work hero-work--${index + 1}" href="${projectHref(project.id)}" data-feature-id="${esc(project.id)}">
      ${slideshowMarkup(project, { eager: index === 0 })}
      <span class="hero-work__number mono">${String(index + 1).padStart(2, "0")}</span>
      <span class="hero-work__caption">
        <small class="mono">${esc(featureLabel(project, group))}</small>
        <strong>${esc(project.title)}</strong>
        <i aria-hidden="true">↗</i>
      </span>
    </a>`;
}

function coverFeatureCard(feature, index) {
  const { project, group } = feature;
  return `
    <a class="cover-card cover-card--${index + 1}" href="${projectHref(project.id)}" data-cover-card data-feature-id="${esc(project.id)}">
      <span class="cover-card__media">
        ${slideshowMarkup(project, { eager: true })}
      </span>
      <span class="cover-card__caption">
        <small class="mono">0${index + 1} / ${esc(group.short)}</small>
        <strong>${esc(project.title)}</strong>
        <i aria-hidden="true">↗</i>
      </span>
    </a>`;
}

function setupCoverMotion() {
  const cover = document.querySelector(".cover-page");
  const cards = [...document.querySelectorAll("[data-cover-card]")];
  if (!cover || !cards.length || reducedMotion) return;

  let pointerX = 0;
  let pointerY = 0;
  let ticking = false;
  const update = () => {
    const rect = cover.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
    cards.forEach((card, index) => {
      const direction = index % 2 ? -1 : 1;
      card.style.setProperty("--cover-pan-x", `${pointerX * (8 + index * 3) * direction}px`);
      card.style.setProperty("--cover-pan-y", `${pointerY * (7 + index * 2) - progress * (8 + index * 3)}px`);
    });
    cover.style.setProperty("--cover-copy-shift", `${progress * -24}px`);
    cover.style.setProperty("--cover-gallery-shift", `${progress * -10}px`);
    cover.style.setProperty("--cover-fade", String(Math.max(.38, 1 - progress * .82)));
    ticking = false;
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  cover.addEventListener("pointermove", event => {
    const rect = cover.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    requestUpdate();
  });
  cover.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    requestUpdate();
  });
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate);
  update();
}

function groupEdition(group, projects) {
  const groupProjects = projects.filter(project => project.group === group.id && project.published !== false);
  const descendants = groupProjects.filter(project => project.level > 1).length;

  return `
    <section class="edition reveal" id="edition-${esc(group.id)}" style="--edition-accent:${esc(group.accent)}">
      <header class="edition__header">
        <span class="edition__number mono">${esc(group.number)}</span>
        <div>
          <p class="eyebrow mono">${esc(group.kicker)}</p>
          <h2><a href="${groupHref(group.id)}">${esc(group.title)}</a></h2>
        </div>
        <div class="edition__intro">
          <p>${esc(group.intro)}</p>
          <span class="mono">${groupProjects.length} project pages / ${descendants} nested stories</span>
        </div>
      </header>
      <div class="edition__grid edition__features" data-edition-features="${esc(group.id)}"></div>
    </section>`;
}

function editionFeatureMarkup(group, leadFeature, groupProjects, index) {
  const secondary = groupProjects
    .filter(project => project.level === 1 && project.id !== leadFeature.id)
    .slice(0, 3);

  return `
    <article class="lead-story" data-feature-id="${esc(leadFeature.id)}">
      <a class="lead-story__media" href="${projectHref(leadFeature.id)}">
        ${slideshowMarkup(leadFeature, { eager: index === 0 })}
        <span class="lead-story__label mono">Featured story / ${esc(group.short)}</span>
      </a>
      <div class="lead-story__copy">
        <h3><a href="${projectHref(leadFeature.id)}">${esc(leadFeature.title)}</a></h3>
        <p>${esc(leadFeature.summary)}</p>
        <a class="text-link" href="${projectHref(leadFeature.id)}">Read feature <span>↗</span></a>
      </div>
    </article>
    <div class="edition__columns">
      ${secondary.map((project, secondaryIndex) => projectCard(project, {
        compact: true,
        index: `${group.number}.${secondaryIndex + 1}`
      })).join("")}
      <a class="edition__all" href="${groupHref(group.id)}">
        <span class="mono">Open the complete desk</span>
        <strong>${esc(group.title)} <i>↗</i></strong>
      </a>
    </div>`;
}

function setupEditionFeatures(groups, projects) {
  document.querySelectorAll("[data-edition-features]").forEach((stage, index) => {
    const group = groups.find(item => item.id === stage.dataset.editionFeatures);
    const groupProjects = projects.filter(project => project.group === group?.id && project.published !== false);
    const leadFeature = featureProject(group, projects);
    stage.innerHTML = leadFeature
      ? editionFeatureMarkup(group, leadFeature, groupProjects, index)
      : '<p class="load-error">No suitable feature image is available in this desk.</p>';
    stage.querySelectorAll(".reveal").forEach(node => node.classList.add("is-visible"));
  });
}

function archiveRow(project, index, groups) {
  const group = groups.find(item => item.id === project.group);
  return `
    <article class="archive-item reveal" data-archive-group="${esc(project.group)}">
      <span class="archive-item__number mono">${String(index + 1).padStart(2, "0")}</span>
      <a class="archive-item__thumb media-fallback" data-fallback-label="${esc(project.title)}" href="${projectHref(project.id)}">
        <img src="${esc(project.cover)}" alt="" loading="lazy">
      </a>
      <div class="archive-item__title" style="--indent:${Math.min(project.level - 1, 3)}">
        <small class="mono">${esc(group?.short)} / L${project.level}</small>
        <h3><a href="${projectHref(project.id)}">${esc(project.title)}</a></h3>
      </div>
      <p>${esc(project.summary)}</p>
      <a class="archive-item__open" href="${projectHref(project.id)}" aria-label="Open ${esc(project.title)}">↗</a>
    </article>`;
}

function applyArchiveFilter(selected) {
  document.querySelectorAll("[data-archive-filter]").forEach(item => {
    const active = item.dataset.archiveFilter === selected;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-archive-group]").forEach(row => {
    row.hidden = selected !== "all" && row.dataset.archiveGroup !== selected;
  });
}

function setupArchiveFilters(defaultGroup) {
  document.querySelectorAll("[data-archive-filter]").forEach(button => button.addEventListener("click", () => {
    applyArchiveFilter(button.dataset.archiveFilter);
  }));
  applyArchiveFilter(defaultGroup);
}

function sectionBreakMarkup(item) {
  const hasBody = Boolean(item.body?.trim());
  return `
    <header class="section-break${hasBody ? "" : " section-break--solo"} reveal">
      <p class="eyebrow mono">${esc(item.kicker)}</p>
      <h2>${esc(item.heading)}${item.accent ? ` <em>${esc(item.accent)}</em>` : ""}</h2>
      ${hasBody ? `<p>${esc(item.body)}</p>` : ""}
    </header>`;
}

function renderSectionBreaks(items = []) {
  document.querySelectorAll("[data-break-slot]").forEach(slot => {
    const matches = items.filter(item => item.position === slot.dataset.breakSlot && item.visible !== false);
    slot.innerHTML = matches.map(sectionBreakMarkup).join("");
    slot.toggleAttribute("hidden", matches.length === 0);
  });
}

function renderSubTagline(node, text) {
  const match = String(text || "").trim().match(/^(.+?\.)\s*(.+)$/);
  node.innerHTML = match
    ? `<span>${esc(match[1])}</span> <em>${esc(match[2])}</em>`
    : esc(text);
}

function setupManifestoScroll() {
  const manifesto = document.querySelector("[data-manifesto]");
  if (!manifesto || reducedMotion) {
    manifesto?.style.setProperty("--manifesto-progress", "1");
    return;
  }

  let ticking = false;
  const update = () => {
    const rect = manifesto.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight * .78)));
    manifesto.style.setProperty("--manifesto-progress", progress.toFixed(3));
    ticking = false;
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate);
  update();
}

function finishEntryTransition() {
  const loader = document.querySelector(".site-loader");
  document.body.classList.add("is-loaded");
  if (!loader) return;
  if (reducedMotion) {
    loader.remove();
    return;
  }
  setTimeout(() => loader.remove(), 850);
}

function render(data) {
  const groups = data.groups || [];
  const projects = (data.projects || []).filter(project => project.published !== false);
  const { site, home = {} } = data;
  document.querySelectorAll("[data-site-name]").forEach(node => node.textContent = site.name);
  document.querySelectorAll("[data-loader-name]").forEach(node => node.textContent = site.name);
  document.querySelector("[data-home-kicker]").textContent = site.eyebrow;
  document.querySelector("[data-home-headline]").textContent = site.headline;
  document.querySelector("[data-home-intro]").textContent = site.intro;
  document.querySelector("[data-cv]").href = site.cvUrl;
  renderSubTagline(document.querySelector("[data-home-subtagline]"), home.subTagline);

  const landingFeatures = chooseLandingFeatures(groups, projects);
  document.querySelector("#cover-features").innerHTML = landingFeatures.map(coverFeatureCard).join("");
  document.querySelector("[data-hero-stage]").innerHTML = landingFeatures.map(heroFeatureCard).join("");

  renderSectionBreaks(home.sectionBreaks);
  document.querySelector("#editions").innerHTML = groups.map(group => groupEdition(group, projects)).join("");
  setupEditionFeatures(groups, projects);

  const defaultArchiveGroup = groups[0]?.id || "all";
  document.querySelector("#archive-filters").innerHTML = [
    `<button type="button" data-archive-filter="all" aria-pressed="false">All / ${projects.length}</button>`,
    ...groups.map(group => `<button type="button" data-archive-filter="${esc(group.id)}" aria-pressed="false">${esc(group.short)} / ${projects.filter(project => project.group === group.id).length}</button>`)
  ].join("");
  document.querySelector("#archive-list").innerHTML = projects.map((project, index) => archiveRow(project, index, groups)).join("");

  setupMediaSlides();
  setupCoverMotion();
  setupArchiveFilters(defaultArchiveGroup);
  setupManifestoScroll();
  setupReveal();
  document.body.classList.add("is-ready");
  requestAnimationFrame(() => requestAnimationFrame(finishEntryTransition));
}

setupChrome();
loadPortfolio().then(render).catch(error => {
  console.error(error);
  document.querySelector("#editions").innerHTML = '<p class="load-error">The portfolio could not be loaded. Please refresh the page.</p>';
  finishEntryTransition();
});
