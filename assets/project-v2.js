const esc = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const paras = text => String(text || "").split(/\n\s*\n/).filter(Boolean).map(value => `<p>${esc(value)}</p>`).join("");
const projectHref = id => `project.html?id=${encodeURIComponent(id)}`;

function youtubeEmbed(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const playlist = parsed.searchParams.get("list");
    if (playlist) return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlist)}`;
    let id = parsed.searchParams.get("v");
    if (!id && parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1).split("/")[0];
    if (!id && /\/shorts\//.test(parsed.pathname)) id = parsed.pathname.split("/shorts/")[1].split("/")[0];
    if (!id && /\/embed\//.test(parsed.pathname)) id = parsed.pathname.split("/embed/")[1].split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : "";
  } catch (_) {
    return "";
  }
}

function fileCard(item, index) {
  return `
    <article class="file-card">
      <div class="file-thumb media-fallback" data-fallback-label="${esc(item.type)}"><img src="${esc(item.thumbnail)}" alt="" loading="lazy"></div>
      <div class="file-copy">
        <span class="file-type">${esc(item.type)} / ${String(index + 1).padStart(2, "0")}</span>
        <span class="file-title" title="${esc(item.title)}">${esc(item.title)}</span>
        <span class="file-actions">
          <button type="button" data-file-preview="${esc(item.previewUrl)}" data-file-title="${esc(item.title)}">View here</button>
          <a href="${esc(item.sourceUrl)}" target="_blank" rel="noreferrer">Drive ↗</a>
        </span>
      </div>
    </article>`;
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    nodes.forEach(node => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), {threshold:.1, rootMargin:"0px 0px -7%"});
  nodes.forEach(node => observer.observe(node));
}

function setupChrome() {
  addEventListener("error", event => {
    if (event.target instanceof HTMLImageElement) event.target.closest(".file-thumb,.hero-media,.gallery-button,.youtube-poster")?.classList.add("image-failed");
  }, true);
  document.body.insertAdjacentHTML("afterbegin", '<div class="scroll-progress" aria-hidden="true"></div>');
  const progress = document.querySelector(".scroll-progress");
  const header = document.querySelector(".site-header");
  let ticking = false;
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
    header?.classList.toggle("scrolled", scrollY > 16);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, {passive:true});
  update();
}

function render(portfolio) {
  const id = new URLSearchParams(location.search).get("id");
  const project = portfolio.projects.find(item => item.id === id);
  if (!project) {
    document.querySelector("#app").innerHTML = '<section class="not-found shell"><p class="eyebrow mono">Project not found</p><h1>This record is not available.</h1><a class="evidence" href="index.html#archive">Return to archive →</a></section>';
    return;
  }

  const category = portfolio.categories.find(item => item.id === project.category);
  const siblings = portfolio.projects.filter(item => item.category === project.category);
  const siblingIndex = siblings.findIndex(item => item.id === project.id);
  const previous = siblings[(siblingIndex - 1 + siblings.length) % siblings.length];
  const next = siblings[(siblingIndex + 1) % siblings.length];
  const images = project.media.filter(item => item.type === "image");
  const files = project.media.filter(item => item.type !== "image");
  const youtube = youtubeEmbed(project.youtubeUrl);

  document.title = `${project.title} | Khiet Lam`;
  document.querySelector('meta[name="description"]').setAttribute("content", project.summary);
  document.querySelector("#app").innerHTML = `
    <section class="project-hero shell">
      <div class="hero-copy reveal">
        <a class="back-link" href="index.html#featured">← Back to collections</a>
        <p class="eyebrow mono">${esc(category?.label)} / ${esc(project.period)}</p>
        <h1>${esc(project.title)}</h1>
        <p class="hero-summary">${esc(project.summary)}</p>
        <div class="facts">
          <div class="fact"><span>Role</span><strong>${esc(project.role)}</strong></div>
          <div class="fact"><span>Organisation</span><strong>${esc(project.client)}</strong></div>
          <div class="fact"><span>Collection</span><strong>${project.media.length} records</strong></div>
        </div>
      </div>
      <div class="hero-media reveal media-fallback" data-fallback-label="${esc(project.title)}"><img src="${esc(project.cover)}" alt="${esc(project.imageAlt || project.title)}"></div>
    </section>

    <section class="section shell reveal">
      <div class="content-layout">
        <div><p class="eyebrow mono">Project article / Context and contribution</p><h2>About the work</h2></div>
        <article class="article">
          <p class="article-lede">${esc(project.summary)}</p>
          ${paras(project.article)}
          <p class="outcome">${esc(project.outcome)}</p>
          <div class="tags">${project.tags.map(tag => `<span class="tag">${esc(tag)}</span>`).join("")}</div>
          <a class="evidence" href="${esc(project.folderUrl)}" target="_blank" rel="noreferrer">Open complete Drive folder <span>↗</span></a>
        </article>
      </div>
    </section>

    <section class="section media-section reveal">
      <div class="shell">
        <div class="media-heading">
          <div><p class="eyebrow mono">Drive collection / Full record</p><h2>${images.length ? "Images" : "Project files"}${files.length || youtube ? " and media" : ""}</h2></div>
          <span class="media-count">${images.length} images / ${files.length} files</span>
        </div>
        ${youtube ? `
          <div class="youtube-shell">
            <button class="youtube-poster media-fallback" data-fallback-label="YouTube preview" type="button" data-youtube-embed="${esc(youtube)}" aria-label="Play YouTube video for ${esc(project.title)}">
              <img src="${esc(project.youtubeThumbnail || project.cover)}" alt="YouTube preview for ${esc(project.title)}">
              <span class="youtube-play">▶</span><span class="youtube-label">Play YouTube archive</span>
            </button>
          </div>` : ""}
        ${images.length ? `
          <div class="gallery-shell" data-gallery-mode="slider">
            <div class="gallery-viewport">
              <div class="gallery-track">
                ${images.map((item, index) => `
                  <figure class="gallery-slide">
                    <button class="gallery-button media-fallback" data-fallback-label="Image ${String(index + 1).padStart(2,"0")}" type="button" data-image-index="${index}" aria-label="Enlarge image ${index + 1}">
                      <img src="${esc(item.thumbnail)}" alt="${esc(project.title)} image ${index + 1}" loading="${index < 8 ? "eager" : "lazy"}">
                    </button>
                    <figcaption class="gallery-caption"><span>${esc(item.title)}</span><span>${String(index + 1).padStart(2,"0")} / ${String(images.length).padStart(2,"0")}</span></figcaption>
                  </figure>`).join("")}
              </div>
            </div>
            <div class="gallery-controls">
              <div class="gallery-progress"><span></span></div>
              <span class="gallery-mode mono" data-gallery-mode-label>Checking image set…</span>
              <span class="mono" data-gallery-count>01 / ${String(images.length).padStart(2,"0")}</span>
              <button type="button" data-gallery-direction="prev" aria-label="Previous image">←</button>
              <button type="button" data-gallery-direction="next" aria-label="Next image">→</button>
            </div>
          </div>` : '<div class="empty-media">This collection is document and video led. Open any record below in the Drive viewer.</div>'}

        ${files.length ? `
          <div class="file-library">
            <div class="file-library-head"><h3>Documents, video and source files</h3><small>${files.length} Drive records</small></div>
            <div class="file-grid">${files.map(fileCard).join("")}</div>
          </div>` : ""}
      </div>
    </section>

    <nav class="project-nav shell" aria-label="Previous and next project in ${esc(category?.label)}">
      <a href="${projectHref(previous.id)}"><span>Previous in ${esc(category?.short)}</span><strong>← ${esc(previous.title)}</strong></a>
      <a href="${projectHref(next.id)}"><span>Next in ${esc(category?.short)}</span><strong>${esc(next.title)} →</strong></a>
    </nav>

    <dialog class="media-dialog lightbox-dialog" aria-label="Full image viewer">
      <div class="dialog-bar"><span class="dialog-title" data-lightbox-title>${esc(project.title)}</span><div class="zoom-controls" aria-label="Image zoom controls"><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset" data-zoom-level aria-label="Reset zoom">100%</button><button type="button" data-zoom="in" aria-label="Zoom in">+</button></div><button class="dialog-close" type="button" data-dialog-close aria-label="Close image viewer">×</button></div>
      <div class="lightbox-stage"><button class="lightbox-nav prev" type="button" data-lightbox-direction="prev" aria-label="Previous image">←</button><img data-lightbox-image alt=""><button class="lightbox-nav next" type="button" data-lightbox-direction="next" aria-label="Next image">→</button></div>
    </dialog>
    <dialog class="media-dialog viewer-dialog" aria-label="Drive file viewer">
      <div class="dialog-bar"><span class="dialog-title" data-viewer-title>Drive file</span><button class="dialog-close" type="button" data-dialog-close aria-label="Close file viewer">×</button></div>
      <iframe class="viewer-frame" data-viewer-frame title="Drive file preview" allow="autoplay; fullscreen" allowfullscreen></iframe>
    </dialog>`;

  const galleryShell = document.querySelector(".gallery-shell");
  const galleryTrack = document.querySelector(".gallery-track");
  const galleryProgress = document.querySelector(".gallery-progress span");
  const galleryCount = document.querySelector("[data-gallery-count]");
  const galleryModeLabel = document.querySelector("[data-gallery-mode-label]");
  let galleryIndex = 0;
  const setGallery = nextIndex => {
    if (!images.length || !galleryTrack || galleryShell?.classList.contains("is-collage")) return;
    galleryIndex = (nextIndex + images.length) % images.length;
    galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
    if (galleryProgress) galleryProgress.style.transform = `scaleX(${(galleryIndex + 1) / images.length})`;
    if (galleryCount) galleryCount.textContent = `${String(galleryIndex + 1).padStart(2,"0")} / ${String(images.length).padStart(2,"0")}`;
  };
  document.querySelectorAll("[data-gallery-direction]").forEach(button => button.addEventListener("click", () => setGallery(galleryIndex + (button.dataset.galleryDirection === "next" ? 1 : -1))));
  setGallery(0);

  const viewport = document.querySelector(".gallery-viewport");
  let startX = 0;
  viewport?.addEventListener("pointerdown", event => startX = event.clientX);
  viewport?.addEventListener("pointerup", event => { const delta = event.clientX - startX; if (Math.abs(delta) > 45) setGallery(galleryIndex + (delta < 0 ? 1 : -1)); });

  const chooseGalleryLayout = () => {
    if (!galleryShell || images.length < 3) {
      if (galleryModeLabel) galleryModeLabel.textContent = "Slide view";
      return;
    }
    const nodes = [...document.querySelectorAll(".gallery-button img")].slice(0, 8);
    const ready = nodes.map(image => new Promise(resolve => {
      if (image.complete) resolve();
      else {
        image.addEventListener("load", resolve, {once:true});
        image.addEventListener("error", resolve, {once:true});
      }
    }));
    Promise.race([Promise.all(ready), new Promise(resolve => setTimeout(resolve, 2600))]).then(() => {
      const ratios = nodes.filter(image => image.naturalWidth && image.naturalHeight).map(image => image.naturalWidth / image.naturalHeight);
      const mixedOrientation = ratios.some(ratio => ratio < .84) && ratios.some(ratio => ratio > 1.18);
      const spread = ratios.length ? Math.max(...ratios) / Math.max(.01, Math.min(...ratios)) : 1;
      const collage = images.length >= 4 && (mixedOrientation || spread > 1.48);
      galleryShell.classList.toggle("is-collage", collage);
      galleryShell.dataset.galleryMode = collage ? "collage" : "slider";
      if (galleryTrack) galleryTrack.style.transform = collage ? "none" : `translateX(-${galleryIndex * 100}%)`;
      if (galleryModeLabel) galleryModeLabel.textContent = collage ? "Adaptive collage" : "Slide view";
    });
  };
  chooseGalleryLayout();

  const lightbox = document.querySelector(".lightbox-dialog");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxTitle = document.querySelector("[data-lightbox-title]");
  const lightboxStage = document.querySelector(".lightbox-stage");
  const zoomLevel = document.querySelector("[data-zoom-level]");
  let lightboxIndex = 0;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  const applyZoom = () => {
    if (!lightboxImage) return;
    lightboxImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
    lightboxStage?.classList.toggle("is-draggable", zoom > 1);
    if (zoomLevel) zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  };
  const setZoom = value => {
    zoom = Math.min(4, Math.max(1, value));
    if (zoom === 1) { panX = 0; panY = 0; }
    applyZoom();
  };
  const setLightbox = nextIndex => {
    if (!images.length) return;
    lightboxIndex = (nextIndex + images.length) % images.length;
    lightboxImage.src = images[lightboxIndex].thumbnail.replace(/sz=w\d+/i, "sz=w3200");
    lightboxImage.alt = `${project.title} image ${lightboxIndex + 1}`;
    lightboxTitle.textContent = `${images[lightboxIndex].title} / ${lightboxIndex + 1} of ${images.length}`;
    setZoom(1);
  };
  document.querySelectorAll("[data-image-index]").forEach(button => button.addEventListener("click", () => { setLightbox(Number(button.dataset.imageIndex)); lightbox.showModal(); }));
  document.querySelectorAll("[data-lightbox-direction]").forEach(button => button.addEventListener("click", () => setLightbox(lightboxIndex + (button.dataset.lightboxDirection === "next" ? 1 : -1))));
  document.querySelectorAll("[data-zoom]").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.zoom === "in") setZoom(zoom + .5);
    if (button.dataset.zoom === "out") setZoom(zoom - .5);
    if (button.dataset.zoom === "reset") setZoom(1);
  }));
  lightboxStage?.addEventListener("wheel", event => {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? .25 : -.25));
  }, {passive:false});
  lightboxImage?.addEventListener("pointerdown", event => {
    if (zoom <= 1) return;
    dragging = true;
    dragStartX = event.clientX - panX;
    dragStartY = event.clientY - panY;
    lightboxImage.setPointerCapture(event.pointerId);
  });
  lightboxImage?.addEventListener("pointermove", event => {
    if (!dragging) return;
    panX = event.clientX - dragStartX;
    panY = event.clientY - dragStartY;
    applyZoom();
  });
  lightboxImage?.addEventListener("pointerup", event => {
    dragging = false;
    if (lightboxImage.hasPointerCapture(event.pointerId)) lightboxImage.releasePointerCapture(event.pointerId);
  });

  const youtubePoster = document.querySelector("[data-youtube-embed]");
  youtubePoster?.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.className = "youtube-frame";
    iframe.src = `${youtubePoster.dataset.youtubeEmbed}${youtubePoster.dataset.youtubeEmbed.includes("?") ? "&" : "?"}autoplay=1`;
    iframe.title = `YouTube video for ${project.title}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    youtubePoster.replaceWith(iframe);
  });

  const viewer = document.querySelector(".viewer-dialog");
  const viewerFrame = document.querySelector("[data-viewer-frame]");
  document.querySelectorAll("[data-file-preview]").forEach(button => button.addEventListener("click", () => {
    document.querySelector("[data-viewer-title]").textContent = button.dataset.fileTitle;
    viewerFrame.src = button.dataset.filePreview;
    viewer.showModal();
  }));
  document.querySelectorAll("[data-dialog-close]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  viewer.addEventListener("close", () => viewerFrame.src = "about:blank");
  [lightbox, viewer].forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }));

  addEventListener("keydown", event => {
    if (lightbox.open && event.key === "ArrowRight") setLightbox(lightboxIndex + 1);
    if (lightbox.open && event.key === "ArrowLeft") setLightbox(lightboxIndex - 1);
  });
  document.querySelectorAll("img").forEach(image => image.addEventListener("error", () => image.closest(".file-thumb,.hero-media,.gallery-button,.youtube-poster")?.classList.add("image-failed"), {once:true}));
  setupReveal();
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

setupChrome();
fetch(`data/portfolio.json?v=${Date.now()}`)
  .then(response => { if (!response.ok) throw new Error("Portfolio unavailable"); return response.json(); })
  .then(render)
  .catch(error => {
    console.error(error);
    document.querySelector("#app").innerHTML = '<section class="not-found shell"><p class="eyebrow mono">Loading error</p><h1>This project could not be opened.</h1><a class="evidence" href="index.html#archive">Return to archive →</a></section>';
  });
