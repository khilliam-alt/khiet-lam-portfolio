const {
  ancestorsOf,
  childrenOf,
  dialogMarkup,
  documentType,
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

const paragraphs = text => String(text || "")
  .split(/\n\s*\n/)
  .filter(Boolean)
  .map(value => `<p>${esc(value)}</p>`)
  .join("");

function fileCard(item, index) {
  const type = documentType(item);
  const canPreview = item.previewUrl && item.previewUrl !== item.sourceUrl;
  return `
    <article class="file-card reveal">
      <button class="file-card__thumb media-fallback" type="button" ${canPreview ? `data-open-frame="${esc(item.previewUrl)}" data-frame-title="${esc(item.title)}"` : ""} data-fallback-label="${esc(type)}">
        <img src="${esc(item.thumbnail)}" alt="" loading="lazy">
        <span class="mono">${esc(type)}</span>
      </button>
      <div class="file-card__copy">
        <p class="mono">${String(index + 1).padStart(2, "0")} / ${esc(type)}</p>
        <h3>${esc(item.title)}</h3>
        <div>
          ${canPreview ? `<button class="text-link" type="button" data-open-frame="${esc(item.previewUrl)}" data-frame-title="${esc(item.title)}">View here <span>↗</span></button>` : ""}
          <a class="text-link" href="${esc(item.sourceUrl)}" target="_blank" rel="noreferrer">Drive <span>↗</span></a>
        </div>
      </div>
    </article>`;
}

function breadcrumbs(project, projects, group) {
  const ancestors = ancestorsOf(projects, project);
  return `
    <nav class="breadcrumbs mono" aria-label="Breadcrumb">
      <a href="index.html">Portfolio</a><span>/</span>
      <a href="${groupHref(group.id)}">${esc(group.title)}</a>
      ${ancestors.map(item => `<span>/</span><a href="${projectHref(item.id)}">${esc(item.title)}</a>`).join("")}
      <span>/</span><strong>${esc(project.title)}</strong>
    </nav>`;
}

function childrenSection(children) {
  if (!children.length) return "";
  return `
    <section class="project-children">
      <header class="section-intro reveal">
        <p class="eyebrow mono">Inside this project / Next pyramid level</p>
        <h2>${children.length} related ${children.length === 1 ? "project" : "projects"}.</h2>
        <p>Each card opens a separate project record with its own files and media.</p>
      </header>
      <div class="project-children__grid">
        ${children.map((child, index) => projectCard(child, { compact: true, index: String(index + 1).padStart(2, "0"), showLevel: true })).join("")}
      </div>
    </section>`;
}

function embedSection(project) {
  const youtube = youtubeEmbed(project.youtubeUrl);
  if (!youtube && !project.flipbookUrl && !project.embedUrl) return "";
  return `
    <section class="project-embeds">
      <header class="section-intro reveal">
        <p class="eyebrow mono">Live view / Watch and read</p>
        <h2>Open the work <em>inside this page.</em></h2>
      </header>
      <div class="embed-grid${[youtube, project.flipbookUrl, project.embedUrl].filter(Boolean).length === 1 ? " embed-grid--single" : ""}">
        ${youtube ? `
          <article class="embed-card reveal">
            <div class="embed-card__frame embed-card__frame--video">
              <iframe src="${esc(youtube)}" title="YouTube video for ${esc(project.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            <p class="mono">YouTube / Public episode</p>
          </article>` : ""}
        ${project.flipbookUrl ? `
          <article class="embed-card reveal">
            <div class="embed-card__frame embed-card__frame--document" style="--document-cover:url('${esc(project.cover)}')">
              <iframe src="${esc(project.flipbookUrl)}" title="Interactive flipbook for ${esc(project.title)}" loading="lazy" allowfullscreen></iframe>
            </div>
            <p class="mono">Interactive flipbook / Editor and proofreader</p>
          </article>` : ""}
        ${project.embedUrl ? `
          <article class="embed-card reveal">
            <div class="embed-card__frame embed-card__frame--document" style="--document-cover:url('${esc(project.cover)}')">
              <iframe src="${esc(project.embedUrl)}" title="View only ebook for ${esc(project.title)}" loading="lazy" allowfullscreen></iframe>
            </div>
            <p class="mono">Google Drive / View only edition</p>
            <small>If the publisher limits embedding, use “Open complete Drive folder” below and view it with your authorised Google account.</small>
          </article>` : ""}
      </div>
    </section>`;
}

function galleryMarkup(images, title) {
  if (!images.length) return "";
  return `
    <div class="adaptive-gallery" data-adaptive-gallery>
      <div class="adaptive-gallery__viewport">
        <div class="adaptive-gallery__track">
          ${images.map((item, index) => `
            <figure class="adaptive-gallery__item">
              <button class="adaptive-gallery__button media-fallback" type="button" data-image-index="${index}" data-fallback-label="${esc(item.title)}">
                <img src="${esc(item.thumbnail)}" alt="${esc(title)} — ${esc(item.title)}" loading="${index < 6 ? "eager" : "lazy"}">
              </button>
              <figcaption><span>${esc(item.title)}</span><span class="mono">${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}</span></figcaption>
            </figure>`).join("")}
        </div>
      </div>
      <div class="adaptive-gallery__controls">
        <span class="mono" data-gallery-mode>Reading image proportions…</span>
        <div class="gallery-meter"><span data-gallery-meter></span></div>
        <span class="mono" data-gallery-position>01 / ${String(images.length).padStart(2, "0")}</span>
        <button type="button" data-gallery-prev aria-label="Previous image">←</button>
        <button type="button" data-gallery-next aria-label="Next image">→</button>
      </div>
    </div>`;
}

function setupAdaptiveGallery(images) {
  const shell = document.querySelector("[data-adaptive-gallery]");
  if (!shell || !images.length) return;
  const imageNodes = [...shell.querySelectorAll(".adaptive-gallery__item img")];
  const track = shell.querySelector(".adaptive-gallery__track");
  const modeLabel = shell.querySelector("[data-gallery-mode]");
  const position = shell.querySelector("[data-gallery-position]");
  const meter = shell.querySelector("[data-gallery-meter]");
  let index = 0;

  const setIndex = next => {
    index = (next + images.length) % images.length;
    track.style.transform = `translate3d(-${index * 100}%,0,0)`;
    position.textContent = `${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    meter.style.transform = `scaleX(${(index + 1) / images.length})`;
  };

  Promise.all(imageNodes.map(image => new Promise(resolve => {
    if (image.complete) resolve(image);
    else {
      image.addEventListener("load", () => resolve(image), { once: true });
      image.addEventListener("error", () => resolve(image), { once: true });
    }
  }))).then(nodes => {
    const ratios = nodes.filter(image => image.naturalWidth && image.naturalHeight).map(image => image.naturalWidth / image.naturalHeight);
    const hasPortrait = ratios.some(ratio => ratio < .86);
    const hasLandscape = ratios.some(ratio => ratio > 1.18);
    const spread = ratios.length ? Math.max(...ratios) - Math.min(...ratios) : 0;
    const collage = images.length > 2 && (spread > .55 || (hasPortrait && hasLandscape));
    shell.classList.add(collage ? "is-collage" : "is-slider");
    modeLabel.textContent = collage ? "Uncropped editorial collage / click to zoom" : "Full frame slider / click to zoom";
    if (!collage) setIndex(0);
  });

  shell.querySelector("[data-gallery-prev]")?.addEventListener("click", () => setIndex(index - 1));
  shell.querySelector("[data-gallery-next]")?.addEventListener("click", () => setIndex(index + 1));
}

function render(data) {
  const id = new URLSearchParams(location.search).get("id");
  const project = data.projects.find(item => item.id === id);
  if (!project) {
    document.querySelector("#project-app").innerHTML = '<section class="error-page"><p class="eyebrow mono">Project not found</p><h1>This record is unavailable.</h1><a class="button-link" href="index.html">Back to portfolio ↗</a></section>';
    return;
  }

  const group = data.groups.find(item => item.id === project.group);
  const children = childrenOf(data.projects, project.id);
  const siblings = data.projects.filter(item => item.group === project.group && item.parentId === project.parentId);
  const siblingIndex = siblings.findIndex(item => item.id === project.id);
  const previous = siblings[(siblingIndex - 1 + siblings.length) % siblings.length];
  const next = siblings[(siblingIndex + 1) % siblings.length];
  const images = project.media.filter(item => documentType(item) === "image");
  const files = project.media.filter(item => documentType(item) !== "image");
  document.title = `${project.title} | Khiet Lam`;
  document.querySelector('meta[name="description"]').setAttribute("content", project.summary);
  document.documentElement.style.setProperty("--group-accent", group?.accent || "#8b352f");

  document.querySelector("#project-app").innerHTML = `
    <section class="project-hero-v3">
      <div class="project-hero-v3__copy reveal">
        ${breadcrumbs(project, data.projects, group)}
        <p class="eyebrow mono">${esc(group.title)} / Pyramid level ${project.level}</p>
        <h1>${esc(project.title)}</h1>
        <p class="project-hero-v3__intro">${esc(project.summary)}</p>
        <div class="project-facts">
          <div><span class="mono">Role</span><strong>${esc(project.role)}</strong></div>
          <div><span class="mono">Organisation</span><strong>${esc(project.client)}</strong></div>
          <div><span class="mono">Period</span><strong>${esc(project.period)}</strong></div>
          <div><span class="mono">Record</span><strong>${project.media.length} files / ${children.length} subprojects</strong></div>
        </div>
      </div>
      <div class="project-hero-v3__visual reveal">
        <div class="project-cover media-fallback" data-fallback-label="${esc(project.title)}">
          <img src="${esc(project.cover)}" alt="${esc(project.imageAlt || project.title)}" loading="eager">
          ${project.youtubeUrl ? `<span class="project-cover__video mono">Video project / ${esc(project.title)}</span>` : ""}
        </div>
      </div>
    </section>

    <section class="project-article">
      <header class="project-article__heading reveal">
        <p class="eyebrow mono">Project article / Context and contribution</p>
        <h2>About the work</h2>
      </header>
      <article class="project-article__copy reveal">
        <p class="article-lede">${esc(project.summary)}</p>
        ${paragraphs(project.article)}
        <blockquote>${esc(project.outcome)}</blockquote>
        <div class="tag-row">${project.tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div>
        <a class="button-link" href="${esc(project.folderUrl)}" target="_blank" rel="noreferrer">Open complete Drive folder <span>↗</span></a>
      </article>
    </section>

    ${embedSection(project)}
    ${childrenSection(children)}

    <section class="project-media">
      <header class="section-intro reveal">
        <p class="eyebrow mono">Evidence archive / Original proportions</p>
        <h2>${images.length ? "Image collection" : "Project documents"}${images.length && files.length ? " and working files" : ""}.</h2>
        <p>Mixed formats use an uncropped collage. Consistent formats use a full frame slider. Every image opens at a larger size with zoom controls.</p>
      </header>
      ${galleryMarkup(images, project.title)}
      ${files.length ? `
        <div class="file-library-v3">
          <header><h3>PDF, video and working files</h3><span class="mono">${files.length} records</span></header>
          <div class="file-grid-v3">${files.map(fileCard).join("")}</div>
        </div>` : ""}
      ${!images.length && !files.length ? '<p class="empty-state">This folder is an editorial parent. Open its subproject cards above to view the complete evidence.</p>' : ""}
    </section>

    <nav class="project-pager" aria-label="Related projects">
      <a href="${projectHref(previous.id)}"><span class="mono">Previous at this level</span><strong>← ${esc(previous.title)}</strong></a>
      <a href="${groupHref(group.id)}"><span class="mono">Overview</span><strong>${esc(group.title)} desk</strong></a>
      <a href="${projectHref(next.id)}"><span class="mono">Next at this level</span><strong>${esc(next.title)} →</strong></a>
    </nav>

    ${dialogMarkup()}
  `;

  setupAdaptiveGallery(images);
  setupFrameDialog();
  setupLightbox(images);
  setupReveal();
  document.body.classList.add("is-ready");
}

setupChrome();
loadPortfolio().then(render).catch(error => {
  console.error(error);
  document.querySelector("#project-app").innerHTML = '<section class="error-page"><h1>The project could not be loaded.</h1></section>';
});
