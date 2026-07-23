const {
  childrenOf,
  descendantsOf,
  dialogMarkup,
  driveThumb,
  esc,
  groupHref,
  loadPortfolio,
  projectCard,
  projectHref,
  setupChrome,
  setupFrameDialog,
  setupLightbox,
  setupReveal,
  youtubeEmbed,
  youtubeThumb
} = window.PortfolioUI;

function showcaseCard(item, projects) {
  const project = projects.find(entry => entry.id === item.projectId);
  const title = item.title || project?.title || "Selected media";
  const cover = item.cover || project?.cover || (item.fileId ? driveThumb(item.fileId) : "");

  if (item.type === "youtube") {
    const embed = youtubeEmbed(item.url);
    return `
      <article class="showcase-card showcase-card--video reveal">
        <button class="showcase-card__media media-fallback" type="button" data-open-frame="${esc(embed)}" data-frame-title="${esc(title)}" data-fallback-label="${esc(title)}">
          <img src="${esc(youtubeThumb(item.url) || cover)}" alt="Video preview for ${esc(title)}" loading="lazy">
          <span class="showcase-play">▶</span>
        </button>
        <div class="showcase-card__copy">
          <p class="mono">YouTube / Video preview</p>
          <h3>${esc(title)}</h3>
          ${project ? `<a class="text-link" href="${projectHref(project.id)}">Open project <span>↗</span></a>` : ""}
        </div>
      </article>`;
  }

  if (item.type === "flipbook" || item.type === "drive" || item.type === "pdf") {
    const preview = item.type === "pdf"
      ? `https://drive.google.com/file/d/${encodeURIComponent(item.fileId)}/preview`
      : item.url;
    const label = item.type === "flipbook" ? "Interactive flipbook" : item.type === "drive" ? "View only ebook" : "PDF reader";
    return `
      <article class="showcase-card reveal">
        <button class="showcase-card__media media-fallback" type="button" data-open-frame="${esc(preview)}" data-frame-title="${esc(title)}" data-fallback-label="${esc(title)}">
          <img src="${esc(cover)}" alt="Cover for ${esc(title)}" loading="lazy">
          <span class="showcase-open mono">Open live view ↗</span>
        </button>
        <div class="showcase-card__copy">
          <p class="mono">${esc(label)}</p>
          <h3>${esc(title)}</h3>
          ${project ? `<a class="text-link" href="${projectHref(project.id)}">Read project <span>↗</span></a>` : ""}
        </div>
      </article>`;
  }

  return project ? projectCard(project, { compact: true }) : "";
}

function nestedMiniCard(project, projects, depth = 0) {
  const children = childrenOf(projects, project.id);
  return `
    <article class="nested-card reveal" style="--nest:${depth}">
      <a class="nested-card__media media-fallback" href="${projectHref(project.id)}" data-fallback-label="${esc(project.title)}">
        <img src="${esc(project.cover)}" alt="" loading="lazy">
      </a>
      <div>
        <p class="mono">Level ${project.level}${children.length ? ` / ${children.length} subprojects` : ""}</p>
        <h4><a href="${projectHref(project.id)}">${esc(project.title)}</a></h4>
        <p>${esc(project.summary)}</p>
        <a class="text-link" href="${projectHref(project.id)}">Read more <span>↗</span></a>
      </div>
    </article>
    ${children.length ? `<div class="nested-card__children">${children.map(child => nestedMiniCard(child, projects, depth + 1)).join("")}</div>` : ""}`;
}

function chapter(project, projects, index) {
  const children = childrenOf(projects, project.id);
  const descendants = descendantsOf(projects, project.id);
  return `
    <section class="chapter reveal ${index % 3 === 1 ? "chapter--reverse" : ""}">
      <div class="chapter__feature">
        <a class="chapter__image media-fallback" href="${projectHref(project.id)}" data-fallback-label="${esc(project.title)}">
          <img src="${esc(project.cover)}" alt="${esc(project.imageAlt || project.title)}" loading="lazy">
          <span class="chapter__index mono">${String(index + 1).padStart(2, "0")}</span>
        </a>
        <div class="chapter__copy">
          <p class="eyebrow mono">${esc(project.editorialLabel || project.role)}</p>
          <h2><a href="${projectHref(project.id)}">${esc(project.title)}</a></h2>
          <p>${esc(project.summary)}</p>
          <div class="chapter__facts mono">
            <span>${esc(project.client)}</span>
            <span>${project.media.length} records</span>
            ${descendants.length ? `<span>${descendants.length} nested projects</span>` : ""}
          </div>
          <a class="button-link" href="${projectHref(project.id)}">Open feature <span>↗</span></a>
        </div>
      </div>
      ${children.length ? `
        <div class="chapter__desk">
          <header>
            <p class="mono">Inside this project / Pyramid level ${project.level + 1}</p>
            <span>${children.length} direct ${children.length === 1 ? "story" : "stories"}</span>
          </header>
          <div class="nested-grid">
            ${children.map(child => nestedMiniCard(child, projects)).join("")}
          </div>
        </div>` : ""}
    </section>`;
}

function dzungCollection(project) {
  const images = project.media.filter(item => item.type === "image");
  return `
    <details class="collapse-collection reveal">
      <summary>
        <span class="mono">Special collection / ${images.length} portraits</span>
        <strong>Creative Director Dzũng Yoko</strong>
        <span class="collapse-action">Expand collection ＋</span>
      </summary>
      <div class="collapse-collection__body">
        <p>${esc(project.summary)}</p>
        <div class="portrait-strip">
          ${images.map((item, index) => `
            <button class="portrait-card media-fallback" type="button" data-image-index="${index}" data-fallback-label="${esc(item.title)}">
              <img src="${esc(item.thumbnail)}" alt="${esc(item.title)}" loading="lazy">
            </button>`).join("")}
        </div>
        <a class="button-link" href="${projectHref(project.id)}">Open the complete Dzũng Yoko project <span>↗</span></a>
      </div>
    </details>`;
}

function render(data) {
  const id = new URLSearchParams(location.search).get("id");
  const group = data.groups.find(item => item.id === id);
  if (!group) {
    document.querySelector("#group-app").innerHTML = '<section class="error-page"><p class="eyebrow mono">Not found</p><h1>This project desk is unavailable.</h1><a class="button-link" href="index.html">Back to portfolio ↗</a></section>';
    return;
  }

  const projects = data.projects.filter(project => project.group === group.id);
  const topLevel = projects.filter(project => project.level === 1);
  const lead = projects.find(project => project.id === group.leadProject) || topLevel[0];
  const dzung = projects.find(project => project.id === "podcast-dzung-yoko");
  document.title = `${group.title} | Khiet Lam`;
  document.documentElement.style.setProperty("--group-accent", group.accent);

  document.querySelector("#group-app").innerHTML = `
    <section class="group-hero">
      <div class="group-hero__copy reveal">
        <a class="back-link mono" href="index.html#editions">← Portfolio front page</a>
        <p class="eyebrow mono">Desk ${esc(group.number)} / ${esc(group.kicker)}</p>
        <h1>${esc(group.title)}</h1>
        <p class="group-hero__intro">${esc(group.intro)}</p>
        <div class="group-hero__stats mono">
          <span>${topLevel.length} lead projects</span>
          <span>${projects.length} project pages</span>
          <span>${projects.filter(project => project.level > 1).length} nested stories</span>
        </div>
      </div>
      <a class="group-hero__image media-fallback reveal" href="${projectHref(lead.id)}" data-fallback-label="${esc(lead.title)}">
        <img src="${esc(lead.cover)}" alt="${esc(lead.imageAlt || lead.title)}" loading="eager">
        <span class="mono">Current cover story / ${esc(lead.title)}</span>
      </a>
      <div class="group-switcher reveal">
        ${data.groups.map(item => `<a class="${item.id === group.id ? "active" : ""}" href="${groupHref(item.id)}"><span>${esc(item.number)}</span>${esc(item.title)}</a>`).join("")}
      </div>
    </section>

    <section class="showcase-section">
      <header class="section-intro reveal">
        <p class="eyebrow mono">Showcase / Watch and read here</p>
        <h2>Selected media, <em>live in the page.</em></h2>
        <p>Video, PDF and flipbook records open without leaving the portfolio. Drive access rules still apply to view-only files.</p>
      </header>
      <div class="showcase-grid">
        ${group.showcase.map(item => showcaseCard(item, projects)).join("")}
      </div>
      ${group.id === "interviews" && dzung ? dzungCollection(dzung) : ""}
    </section>

    <section class="desk-section">
      <header class="section-intro reveal">
        <p class="eyebrow mono">Project pyramid / Editorial desk</p>
        <h2>Lead stories with their <em>related editions.</em></h2>
        <p>Each card represents one Drive folder. Parent projects introduce the body of work; nested projects preserve the evidence at the right depth.</p>
      </header>
      <div class="chapter-list">
        ${topLevel.map((project, index) => chapter(project, projects, index)).join("")}
      </div>
    </section>

    <section class="group-index-section">
      <header class="section-intro reveal">
        <p class="eyebrow mono">Desk index / Every folder</p>
        <h2>The complete ${esc(group.short)} archive.</h2>
      </header>
      <div class="group-index-list">
        ${projects.map((project, index) => `
          <a class="group-index-row reveal" href="${projectHref(project.id)}" style="--level:${Math.min(project.level - 1, 3)}">
            <span class="mono">${String(index + 1).padStart(2, "0")}</span>
            <span class="group-index-thumb media-fallback" data-fallback-label="${esc(project.title)}"><img src="${esc(project.cover)}" alt="" loading="lazy"></span>
            <strong>${esc(project.title)}</strong>
            <small class="mono">L${project.level} / ${esc(project.role)}</small>
            <i>↗</i>
          </a>`).join("")}
      </div>
    </section>

    ${dialogMarkup()}
  `;

  document.querySelectorAll("[data-site-name]").forEach(node => node.textContent = data.site.name);
  const dzungImages = dzung?.media.filter(item => item.type === "image") || [];
  setupFrameDialog();
  setupLightbox(dzungImages);
  setupReveal();
  document.body.classList.add("is-ready");
}

setupChrome();
loadPortfolio().then(render).catch(error => {
  console.error(error);
  document.querySelector("#group-app").innerHTML = '<section class="error-page"><h1>The project desk could not be loaded.</h1></section>';
});
