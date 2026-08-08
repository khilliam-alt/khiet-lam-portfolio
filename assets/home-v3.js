const {
  esc,
  groupHref,
  loadPortfolio,
  projectCard,
  projectHref,
  setupChrome,
  setupReveal
} = window.PortfolioUI;

function groupEdition(group, projects, index) {
  const groupProjects = projects.filter(project => project.group === group.id);
  const lead = groupProjects.find(project => project.id === group.leadProject) || groupProjects[0];
  const secondary = groupProjects
    .filter(project => project.level === 1 && project.id !== lead?.id)
    .slice(0, 3);
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
      <div class="edition__grid">
        <article class="lead-story">
          <a class="lead-story__media media-fallback" href="${projectHref(lead.id)}" data-fallback-label="${esc(lead.title)}">
            <img src="${esc(lead.cover)}" alt="${esc(lead.imageAlt || lead.title)}" loading="${index === 0 ? "eager" : "lazy"}">
            <span class="lead-story__label mono">Lead feature / ${esc(group.short)}</span>
          </a>
          <div class="lead-story__copy">
            <h3><a href="${projectHref(lead.id)}">${esc(lead.title)}</a></h3>
            <p>${esc(lead.summary)}</p>
            <a class="text-link" href="${projectHref(lead.id)}">Read feature <span>↗</span></a>
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
        </div>
      </div>
    </section>`;
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

function heroMediaCard(item, index) {
  const href = item.href || (item.projectId ? projectHref(item.projectId) : "#project-desks");
  return `
    <a class="hero-work hero-work--${index + 1} media-fallback" href="${esc(href)}" data-fallback-label="${esc(item.title)}">
      <img src="${esc(item.image)}" alt="${esc(item.title)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
      <span class="hero-work__number mono">${String(index + 1).padStart(2, "0")}</span>
      <span class="hero-work__caption">
        <small class="mono">${esc(item.label)}</small>
        <strong>${esc(item.title)}</strong>
        <i aria-hidden="true">↗</i>
      </span>
    </a>`;
}

function sectionBreakMarkup(item) {
  return `
    <header class="section-break reveal">
      <p class="eyebrow mono">${esc(item.kicker)}</p>
      <h2>${esc(item.heading)}${item.accent ? ` <em>${esc(item.accent)}</em>` : ""}</h2>
      ${item.body ? `<p>${esc(item.body)}</p>` : ""}
    </header>`;
}

function renderSectionBreaks(items = []) {
  document.querySelectorAll("[data-break-slot]").forEach(slot => {
    const matches = items.filter(item => item.position === slot.dataset.breakSlot && item.visible !== false);
    slot.innerHTML = matches.map(sectionBreakMarkup).join("");
    slot.toggleAttribute("hidden", matches.length === 0);
  });
}

function finishEntryTransition() {
  const loader = document.querySelector(".site-loader");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.classList.add("is-loaded");
  if (!loader) return;
  if (reducedMotion) {
    loader.remove();
    return;
  }

  setTimeout(() => loader.remove(), 850);
}

function render(data) {
  const { groups, projects, site, home } = data;
  document.querySelectorAll("[data-site-name]").forEach(node => node.textContent = site.name);
  document.querySelectorAll("[data-loader-name]").forEach(node => node.textContent = site.name);
  document.querySelector("[data-home-kicker]").textContent = site.eyebrow;
  document.querySelector("[data-home-headline]").textContent = site.headline;
  document.querySelector("[data-home-intro]").textContent = site.intro;
  document.querySelector("[data-cv]").href = site.cvUrl;

  const heroMedia = (home.heroMedia || []).filter(item => item.image).slice(0, 3);
  document.querySelector("#hero-gallery").innerHTML = heroMedia.length
    ? heroMedia.map(heroMediaCard).join("")
    : '<a class="hero-work hero-work--empty" href="#project-desks"><span>Open selected work ↓</span></a>';
  renderSectionBreaks(home.sectionBreaks);

  document.querySelector("#editions").innerHTML = groups.map((group, index) => groupEdition(group, projects, index)).join("");
  const defaultArchiveGroup = groups[0]?.id || "all";
  document.querySelector("#archive-filters").innerHTML = [
    `<button type="button" data-archive-filter="all" aria-pressed="false">All / ${projects.length}</button>`,
    ...groups.map(group => `<button type="button" data-archive-filter="${esc(group.id)}" aria-pressed="false">${esc(group.short)} / ${projects.filter(project => project.group === group.id).length}</button>`)
  ].join("");
  document.querySelector("#archive-list").innerHTML = projects.map((project, index) => archiveRow(project, index, groups)).join("");

  setupArchiveFilters(defaultArchiveGroup);
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
