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
const ROTATION_MS = 3000;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function visualOptions(project) {
  return [...new Set([
    project.cover,
    ...(project.media || []).map(item => item.thumbnail)
  ].filter(Boolean))];
}

function selectFeatures(projects, count, previous = []) {
  const previousIds = new Set(previous.map(item => item.project.id));
  const previousSignatures = new Set(previous.map(item => `${item.project.id}|${item.visual}`));
  const prioritized = [
    ...shuffle(projects.filter(project => !previousIds.has(project.id))),
    ...shuffle(projects.filter(project => previousIds.has(project.id)))
  ];
  const selected = [];
  const selectedIds = new Set();
  const selectedVisuals = new Set();

  for (const project of prioritized) {
    if (selected.length >= count || selectedIds.has(project.id)) continue;
    const options = shuffle(visualOptions(project));
    const visual = options.find(item => (
      !selectedVisuals.has(item) && !previousSignatures.has(`${project.id}|${item}`)
    )) || options.find(item => !selectedVisuals.has(item));
    if (!visual) continue;
    selected.push({ project, visual });
    selectedIds.add(project.id);
    selectedVisuals.add(visual);
  }

  return selected;
}

function featureLabel(project, groups) {
  const group = groups.find(item => item.id === project.group);
  return `${group?.short || project.group} / ${project.editorialLabel || project.role || "Project feature"}`;
}

function heroFeatureCard(feature, index, groups) {
  const { project, visual } = feature;
  return `
    <a class="hero-work hero-work--${index + 1} media-fallback" href="${projectHref(project.id)}"
      data-feature-id="${esc(project.id)}" data-feature-visual="${esc(visual)}" data-fallback-label="${esc(project.title)}">
      <img src="${esc(visual)}" alt="${esc(project.imageAlt || project.title)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
      <span class="hero-work__number mono">${String(index + 1).padStart(2, "0")}</span>
      <span class="hero-work__caption">
        <small class="mono">${esc(featureLabel(project, groups))}</small>
        <strong>${esc(project.title)}</strong>
        <i aria-hidden="true">↗</i>
      </span>
    </a>`;
}

function restartCycleMeter(gallery) {
  gallery.classList.remove("is-cycling");
  void gallery.offsetWidth;
  gallery.classList.add("is-cycling");
}

function setupHeroRotation(projects, groups) {
  const gallery = document.querySelector("#hero-gallery");
  const stage = gallery?.querySelector("[data-hero-stage]");
  const candidates = projects.filter(project => project.published !== false && visualOptions(project).length);
  if (!gallery || !stage) return;

  if (!candidates.length) {
    stage.innerHTML = '<a class="hero-work hero-work--empty" href="#project-desks"><span>Open selected work ↓</span></a>';
    return;
  }

  let current = [];
  let changing = false;
  const draw = () => {
    current = selectFeatures(candidates, Math.min(3, candidates.length), current);
    stage.innerHTML = current.map((feature, index) => heroFeatureCard(feature, index, groups)).join("");
    gallery.classList.remove("is-switching");
    changing = false;
    restartCycleMeter(gallery);
  };
  const rotate = () => {
    if (changing || document.hidden) return;
    changing = true;
    gallery.classList.add("is-switching");
    setTimeout(draw, 260);
  };

  draw();
  if (!reducedMotion && candidates.length > 1) setInterval(rotate, ROTATION_MS);
}

function rotatingProjectCard(feature, options) {
  const project = { ...feature.project, cover: feature.visual };
  return projectCard(project, options).replace(
    '<article class="story-card',
    `<article data-feature-id="${esc(project.id)}" data-feature-visual="${esc(feature.visual)}" class="story-card`
  );
}

function editionFrameMarkup(group, features, index) {
  const [lead, ...secondary] = features;
  if (!lead) return '<p class="load-error">No published features are available in this desk.</p>';

  const project = lead.project;
  return `
    <article class="lead-story" data-feature-id="${esc(project.id)}" data-feature-visual="${esc(lead.visual)}">
      <a class="lead-story__media media-fallback" href="${projectHref(project.id)}" data-fallback-label="${esc(project.title)}">
        <img src="${esc(lead.visual)}" alt="${esc(project.imageAlt || project.title)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
        <span class="lead-story__label mono">Live feature / ${esc(group.short)}</span>
      </a>
      <div class="lead-story__copy">
        <h3><a href="${projectHref(project.id)}">${esc(project.title)}</a></h3>
        <p>${esc(project.summary)}</p>
        <a class="text-link" href="${projectHref(project.id)}">Read feature <span>↗</span></a>
      </div>
    </article>
    <div class="edition__columns">
      ${secondary.map((feature, secondaryIndex) => rotatingProjectCard(feature, {
        compact: true,
        index: `${group.number}.${secondaryIndex + 1}`
      })).join("")}
      <a class="edition__all" href="${groupHref(group.id)}">
        <span class="mono">Open the complete desk</span>
        <strong>${esc(group.title)} <i>↗</i></strong>
      </a>
    </div>`;
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

function setupEditionRotations(groups, projects) {
  document.querySelectorAll("[data-edition-features]").forEach((stage, index) => {
    const group = groups.find(item => item.id === stage.dataset.editionFeatures);
    const candidates = projects.filter(project => (
      project.group === group?.id && project.published !== false && visualOptions(project).length
    ));
    let current = [];
    let visible = index === 0;
    let changing = false;

    const draw = () => {
      current = selectFeatures(candidates, Math.min(4, candidates.length), current);
      stage.innerHTML = editionFrameMarkup(group, current, index);
      stage.querySelectorAll(".reveal").forEach(node => node.classList.add("is-visible"));
      stage.classList.remove("is-switching");
      changing = false;
    };
    const rotate = () => {
      if (!visible || changing || document.hidden || !current.length) return;
      changing = true;
      stage.classList.add("is-switching");
      setTimeout(draw, 260);
    };

    draw();
    if (reducedMotion) return;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
      }, { rootMargin: "20% 0px 20%", threshold: .04 }).observe(stage);
    } else {
      visible = true;
    }
    setTimeout(() => {
      rotate();
      setInterval(rotate, ROTATION_MS);
    }, ROTATION_MS + index * 420);
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

  renderSectionBreaks(home.sectionBreaks);
  document.querySelector("#editions").innerHTML = groups.map(group => groupEdition(group, projects)).join("");

  const defaultArchiveGroup = groups[0]?.id || "all";
  document.querySelector("#archive-filters").innerHTML = [
    `<button type="button" data-archive-filter="all" aria-pressed="false">All / ${projects.length}</button>`,
    ...groups.map(group => `<button type="button" data-archive-filter="${esc(group.id)}" aria-pressed="false">${esc(group.short)} / ${projects.filter(project => project.group === group.id).length}</button>`)
  ].join("");
  document.querySelector("#archive-list").innerHTML = projects.map((project, index) => archiveRow(project, index, groups)).join("");

  setupHeroRotation(projects, groups);
  setupEditionRotations(groups, projects);
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
