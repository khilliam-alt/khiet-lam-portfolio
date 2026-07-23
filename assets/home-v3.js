const {
  esc,
  groupHref,
  loadPortfolio,
  projectCard,
  projectHref,
  setupChrome,
  setupFrameDialog,
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

function profileDocument(item, index) {
  return `
    <article class="document-tile reveal">
      <button class="document-tile__cover media-fallback" type="button" data-open-frame="${esc(item.previewUrl)}" data-frame-title="${esc(item.title)}" data-fallback-label="${esc(item.title)}">
        <img src="${esc(item.thumbnail)}" alt="Cover of ${esc(item.title)}" loading="lazy">
        <span class="mono">Preview here</span>
      </button>
      <div>
        <p class="mono">${String(index + 1).padStart(2, "0")} / ${esc(item.label)}</p>
        <h3>${esc(item.title)}</h3>
        <a class="text-link" href="${esc(item.sourceUrl)}" target="_blank" rel="noreferrer">Open in Drive <span>↗</span></a>
      </div>
    </article>`;
}

function setupArchiveFilters() {
  document.querySelectorAll("[data-archive-filter]").forEach(button => button.addEventListener("click", () => {
    const selected = button.dataset.archiveFilter;
    document.querySelectorAll("[data-archive-filter]").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-archive-group]").forEach(row => {
      row.hidden = selected !== "all" && row.dataset.archiveGroup !== selected;
    });
  }));
}

function render(data) {
  const { groups, projects, profileDocuments, site } = data;
  document.querySelectorAll("[data-site-name]").forEach(node => node.textContent = site.name);
  document.querySelector("[data-home-kicker]").textContent = site.eyebrow;
  document.querySelector("[data-home-headline]").textContent = site.headline;
  document.querySelector("[data-home-intro]").textContent = site.intro;
  document.querySelector("[data-about]").textContent = site.about;
  document.querySelector("[data-cv]").href = site.cvUrl;
  document.querySelector("[data-email]").href = `mailto:${site.email}`;
  document.querySelector("[data-email] span:first-child").textContent = site.email;
  document.querySelector("[data-phone]").href = `tel:${site.phone.replace(/\s/g, "")}`;
  document.querySelector("[data-phone] span:first-child").textContent = site.phone;
  document.querySelector("[data-linkedin]").href = site.linkedin;
  document.querySelector("[data-drive]").href = site.archiveUrl;

  document.querySelector("#group-index").innerHTML = groups.map(group => {
    const count = projects.filter(project => project.group === group.id).length;
    return `
      <a class="desk-link" href="${groupHref(group.id)}">
        <span class="mono">${esc(group.number)}</span>
        <strong>${esc(group.title)}</strong>
        <small>${count}</small>
      </a>`;
  }).join("");

  document.querySelector("#editions").innerHTML = groups.map((group, index) => groupEdition(group, projects, index)).join("");
  document.querySelector("#archive-filters").innerHTML = [
    `<button class="active" type="button" data-archive-filter="all" aria-pressed="true">All / ${projects.length}</button>`,
    ...groups.map(group => `<button type="button" data-archive-filter="${esc(group.id)}" aria-pressed="false">${esc(group.short)} / ${projects.filter(project => project.group === group.id).length}</button>`)
  ].join("");
  document.querySelector("#archive-list").innerHTML = projects.map((project, index) => archiveRow(project, index, groups)).join("");
  document.querySelector("#profile-documents").innerHTML = profileDocuments.map(profileDocument).join("");

  setupArchiveFilters();
  setupFrameDialog();
  setupReveal();
  document.body.classList.add("is-ready");
}

setupChrome();
loadPortfolio().then(render).catch(error => {
  console.error(error);
  document.querySelector("#editions").innerHTML = '<p class="load-error">The portfolio could not be loaded. Please refresh the page.</p>';
});
