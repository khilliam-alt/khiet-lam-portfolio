(() => {
  const { esc, loadPortfolio, projectHref } = window.PortfolioUI;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LANDING_PROJECT_MS = 5800;
  const FEATURE_PROJECT_MS = 7600;
  const REJECTED_VISUAL_NAMES = /(screen\s*shot|screenshot|screen\s*cap|capture|chụp màn|chup man|cap màn|cap man|proposal|brief|factsheet|fact sheet|mockup|avatar|social copy|mặt trước|mat truoc|mặt sau|mat sau|logo|brochure|\.pdf|\.pptx?|\.docx?)/i;

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function stripDesk(text) {
    return String(text || "")
      .replace(/\bdesk\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\//g, " /")
      .replace(/\/\s+/g, "/ ")
      .trim();
  }

  function isPhotoMedia(item) {
    if (item?.type !== "image" || !item.thumbnail || REJECTED_VISUAL_NAMES.test(item.title || "")) return false;
    const mime = item.mime || "";
    return /^image\/(jpeg|jpg|webp|png)$/i.test(mime) || /\.(jpe?g|webp|png)$/i.test(item.title || "");
  }

  function curatedVisuals(project, limit = 3) {
    const photos = [...new Set((project.media || []).filter(isPhotoMedia).map(item => item.thumbnail))];
    if (photos.length) return shuffle(photos).slice(0, limit);

    const cover = project.cover || "";
    const safeCover = cover && !/(logo|screenshot|screen)/i.test(cover);
    return safeCover ? [cover] : [];
  }

  function waitForHomeRender(callback) {
    if (document.body.classList.contains("is-ready")) {
      callback();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains("is-ready")) return;
      observer.disconnect();
      callback();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  function slideshowMarkup(project) {
    const visuals = curatedVisuals(project, 3);
    return `
      ${visuals.map((visual, index) => `
        <img class="media-slide${index === 0 ? " is-active" : ""}" src="${esc(visual)}"
          alt="${esc(project.imageAlt || project.title)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">`).join("")}
      ${visuals.length > 1 ? `<span class="media-slideshow__dots" aria-hidden="true">${visuals.map((_, index) => `<i class="${index === 0 ? "is-active" : ""}"></i>`).join("")}</span>` : ""}`;
  }

  function updateSlideshow(stage, project) {
    if (!stage) return;
    const visuals = curatedVisuals(project, 3);
    stage.dataset.slideCount = String(visuals.length);
    stage.dataset.fallbackLabel = project.title;
    stage.classList.toggle("is-empty", visuals.length === 0);
    stage.innerHTML = slideshowMarkup(project);
  }

  function landingLabel(project, group) {
    return `${stripDesk(group?.short)} / ${project.editorialLabel || project.role || "Selected project"}`;
  }

  function updateLandingCard(card, project, group, index, kind) {
    if (!card) return;
    card.href = projectHref(project.id);
    card.dataset.featureId = project.id;
    updateSlideshow(card.querySelector("[data-media-slideshow]"), project);

    if (kind === "cover") {
      const small = card.querySelector(".cover-card__caption small");
      const strong = card.querySelector(".cover-card__caption strong");
      if (small) small.textContent = `0${index + 1} / ${stripDesk(group?.short)}`;
      if (strong) strong.textContent = project.title;
      return;
    }

    const small = card.querySelector(".hero-work__caption small");
    const strong = card.querySelector(".hero-work__caption strong");
    if (small) small.textContent = landingLabel(project, group);
    if (strong) strong.textContent = project.title;
  }

  function setupSelectedProjectRotation(groups, projects) {
    const groupById = new Map(groups.map(group => [group.id, group]));
    const pool = projects.filter(project => curatedVisuals(project, 1).length);
    const coverCards = [...document.querySelectorAll("#cover-features [data-cover-card]")];
    const heroCards = [...document.querySelectorAll("[data-hero-stage] .hero-work")];
    const slotCount = Math.min(coverCards.length, heroCards.length);
    if (!slotCount || pool.length <= slotCount || reducedMotion) return;

    let slot = 0;
    let paused = false;
    const pauseHosts = [document.querySelector(".cover-gallery"), document.querySelector("#hero-gallery")].filter(Boolean);
    pauseHosts.forEach(host => {
      host.addEventListener("mouseenter", () => { paused = true; });
      host.addEventListener("mouseleave", () => { paused = false; });
      host.addEventListener("focusin", () => { paused = true; });
      host.addEventListener("focusout", () => { paused = false; });
    });

    setInterval(() => {
      if (paused || document.hidden) return;
      const currentIds = new Set(coverCards.slice(0, slotCount).map(card => card.dataset.featureId).filter(Boolean));
      const candidates = shuffle(pool.filter(project => !currentIds.has(project.id)));
      const project = candidates[0];
      if (!project) return;

      const group = groupById.get(project.group);
      const target = slot % slotCount;
      updateLandingCard(coverCards[target], project, group, target, "cover");
      updateLandingCard(heroCards[target], project, group, target, "hero");
      slot = (slot + 1) % slotCount;
    }, LANDING_PROJECT_MS);
  }

  function featurePool(group, projects) {
    const groupProjects = projects.filter(project => project.group === group.id && project.published !== false);
    const children = groupProjects.filter(project => Number(project.level || 1) > 1 && curatedVisuals(project, 1).length);
    const fallback = groupProjects.filter(project => curatedVisuals(project, 1).length);
    return shuffle(children.length ? children : fallback);
  }

  function leadStoryMarkup(project, group, poolSize) {
    const visual = curatedVisuals(project, 1)[0];
    const disabled = poolSize < 2 ? " disabled" : "";
    return `
      <article class="lead-story" data-feature-id="${esc(project.id)}">
        <div class="lead-story__media lead-story__media--random">
          <a class="lead-story__image-link" href="${projectHref(project.id)}">
            <span class="lead-story__single-image">
              <img src="${esc(visual)}" alt="${esc(project.imageAlt || project.title)}" loading="eager" decoding="async">
            </span>
            <span class="lead-story__label mono">Featured story / ${esc(stripDesk(group.short))}</span>
          </a>
          <div class="lead-story__switcher" aria-label="Browse featured projects">
            <button type="button" data-feature-shift="-1" aria-label="Previous featured project"${disabled}>←</button>
            <button type="button" data-feature-shift="1" aria-label="Next featured project"${disabled}>→</button>
          </div>
        </div>
        <div class="lead-story__copy">
          <h3><a href="${projectHref(project.id)}">${esc(project.title)}</a></h3>
          <p>${esc(project.summary)}</p>
          <a class="text-link" href="${projectHref(project.id)}">Read feature <span>↗</span></a>
        </div>
      </article>`;
  }

  function setupEditionFeature(stage, group, projects) {
    const pool = featurePool(group, projects);
    if (!pool.length) return;

    let cursor = Math.floor(Math.random() * pool.length);
    let paused = false;

    const show = (nextCursor, animate = true) => {
      cursor = ((nextCursor % pool.length) + pool.length) % pool.length;
      const existing = stage.querySelector(".lead-story");
      if (!existing) return;

      if (animate && !reducedMotion) stage.classList.add("is-feature-switching");
      const render = () => {
        existing.outerHTML = leadStoryMarkup(pool[cursor], group, pool.length);
        stage.classList.remove("is-feature-switching");
      };
      if (animate && !reducedMotion) setTimeout(render, 120);
      else render();
    };

    stage.addEventListener("click", event => {
      const button = event.target.closest("[data-feature-shift]");
      if (!button || button.disabled) return;
      event.preventDefault();
      show(cursor + Number(button.dataset.featureShift || 0));
    });
    stage.addEventListener("mouseenter", () => { paused = true; });
    stage.addEventListener("mouseleave", () => { paused = false; });
    stage.addEventListener("focusin", () => { paused = true; });
    stage.addEventListener("focusout", () => { paused = false; });

    show(cursor, false);

    if (!reducedMotion && pool.length > 1) {
      setInterval(() => {
        if (!paused && !document.hidden) show(cursor + 1);
      }, FEATURE_PROJECT_MS);
    }
  }

  function cleanDeskCopy() {
    document.querySelectorAll(".cover-card__caption small, .hero-work__caption small, .lead-story__label, .archive-filters button").forEach(node => {
      node.textContent = stripDesk(node.textContent);
    });
    document.querySelectorAll(".edition__all span").forEach(node => {
      node.textContent = "Open the complete project";
    });
  }

  loadPortfolio().then(data => {
    waitForHomeRender(() => {
      const groups = data.groups || [];
      const projects = (data.projects || []).filter(project => project.published !== false);
      cleanDeskCopy();
      document.querySelectorAll("[data-edition-features]").forEach(stage => {
        const group = groups.find(item => item.id === stage.dataset.editionFeatures);
        if (group) setupEditionFeature(stage, group, projects);
      });
      setupSelectedProjectRotation(groups, projects);
    });
  }).catch(error => console.error("Feature rotation unavailable", error));
})();
