(() => {
  const esc = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const groupHref = id => `group.html?id=${encodeURIComponent(id)}`;
  const projectHref = id => `project.html?id=${encodeURIComponent(id)}`;
  const driveThumb = (id, size = "w2000") => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=${size}`;

  function youtubeId(url) {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      let id = parsed.searchParams.get("v");
      if (!id && parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1).split("/")[0];
      if (!id && /\/shorts\//.test(parsed.pathname)) id = parsed.pathname.split("/shorts/")[1].split("/")[0];
      if (!id && /\/embed\//.test(parsed.pathname)) id = parsed.pathname.split("/embed/")[1].split("/")[0];
      return id || "";
    } catch (_) {
      return "";
    }
  }

  function youtubeEmbed(url) {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      const playlist = parsed.searchParams.get("list");
      if (playlist) return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlist)}`;
      const id = youtubeId(url);
      if (!id) return "";
      const rawStart = parsed.searchParams.get("t") || parsed.searchParams.get("start") || "";
      const match = rawStart.match(/(\d+)/);
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${match ? `?start=${match[1]}` : ""}`;
    } catch (_) {
      return "";
    }
  }

  const youtubeThumb = url => {
    const id = youtubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
  };

  async function loadPortfolio() {
    const [editorial, content] = await Promise.all([
      fetch(`data/editorial.json?v=20260724`).then(response => {
        if (!response.ok) throw new Error("Editorial data unavailable");
        return response.json();
      }),
      fetch(`data/content.json?v=20260724`).then(response => {
        if (!response.ok) throw new Error("Site content unavailable");
        return response.json();
      })
    ]);
    return { ...editorial, site: content.site };
  }

  const childrenOf = (projects, id) => projects.filter(project => project.parentId === id);
  const descendantsOf = (projects, id) => {
    const result = [];
    const walk = parentId => childrenOf(projects, parentId).forEach(child => {
      result.push(child);
      walk(child.id);
    });
    walk(id);
    return result;
  };

  function ancestorsOf(projects, project) {
    const result = [];
    let current = project;
    while (current?.parentId) {
      current = projects.find(item => item.id === current.parentId);
      if (current) result.unshift(current);
    }
    return result;
  }

  function imageMarkup(src, alt, eager = false) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
  }

  function projectCard(project, options = {}) {
    const { compact = false, index = "", showLevel = false } = options;
    return `
      <article class="story-card${compact ? " story-card--compact" : ""} reveal">
        <a class="story-card__media media-fallback" href="${projectHref(project.id)}" data-fallback-label="${esc(project.title)}">
          ${imageMarkup(project.cover, project.imageAlt || project.title)}
          ${project.youtubeUrl ? '<span class="story-card__play" aria-hidden="true">▶</span>' : ""}
        </a>
        <div class="story-card__body">
          <p class="story-card__meta mono">${index ? `${esc(index)} / ` : ""}${showLevel ? `Level ${project.level} / ` : ""}${esc(project.editorialLabel || project.role)}</p>
          <h3><a href="${projectHref(project.id)}">${esc(project.title)}</a></h3>
          <p>${esc(project.summary)}</p>
          <a class="text-link" href="${projectHref(project.id)}">Read project <span>↗</span></a>
        </div>
      </article>`;
  }

  function documentType(item) {
    const mime = item.mime || "";
    if (item.type) return item.type;
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("image")) return "image";
    if (mime.includes("video")) return "video";
    if (mime.includes("presentation")) return "presentation";
    if (mime.includes("document") || mime.includes("sheet")) return "document";
    return "file";
  }

  function setupChrome() {
    if (!document.querySelector(".scroll-progress")) {
      document.body.insertAdjacentHTML("afterbegin", '<div class="scroll-progress" aria-hidden="true"></div>');
    }
    const progress = document.querySelector(".scroll-progress");
    const header = document.querySelector(".site-header");
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
      header?.classList.toggle("is-scrolled", scrollY > 12);
      document.documentElement.style.setProperty("--scroll-y", `${Math.min(scrollY, 1000)}px`);
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();

    addEventListener("error", event => {
      if (event.target instanceof HTMLImageElement) {
        const target = event.target.closest(".media-fallback");
        target?.classList.add("image-failed");
      }
    }, true);
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal:not(.is-visible)");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach(node => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: .08, rootMargin: "0px 0px -5%" });
    nodes.forEach(node => observer.observe(node));
  }

  function setupFrameDialog() {
    const dialog = document.querySelector("[data-frame-dialog]");
    const frame = dialog?.querySelector("[data-frame]");
    const title = dialog?.querySelector("[data-frame-title]");
    if (!dialog || !frame || !title) return;

    document.querySelectorAll("[data-open-frame]").forEach(button => button.addEventListener("click", () => {
      frame.src = button.dataset.openFrame;
      title.textContent = button.dataset.frameTitle || "Document viewer";
      dialog.showModal();
    }));

    dialog.querySelector("[data-close-frame]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      frame.src = "about:blank";
    });
  }

  function setupLightbox(images) {
    const dialog = document.querySelector("[data-lightbox]");
    const image = dialog?.querySelector("[data-lightbox-image]");
    const title = dialog?.querySelector("[data-lightbox-title]");
    if (!dialog || !image || !title || !images.length) return;
    let index = 0;
    let scale = 1;

    const show = next => {
      index = (next + images.length) % images.length;
      scale = 1;
      image.style.transform = "scale(1)";
      image.src = images[index].fullUrl || images[index].thumbnail;
      title.textContent = `${images[index].title} — ${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    };

    document.querySelectorAll("[data-image-index]").forEach(button => button.addEventListener("click", () => {
      show(Number(button.dataset.imageIndex));
      dialog.showModal();
    }));
    dialog.querySelector("[data-lightbox-close]")?.addEventListener("click", () => dialog.close());
    dialog.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => show(index - 1));
    dialog.querySelector("[data-lightbox-next]")?.addEventListener("click", () => show(index + 1));
    dialog.querySelectorAll("[data-zoom]").forEach(button => button.addEventListener("click", () => {
      if (button.dataset.zoom === "reset") scale = 1;
      else scale = Math.max(1, Math.min(3, scale + (button.dataset.zoom === "in" ? .25 : -.25)));
      image.style.transform = `scale(${scale})`;
    }));
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
  }

  function dialogMarkup() {
    return `
      <dialog class="viewer-dialog" data-frame-dialog>
        <div class="dialog-bar">
          <span class="mono" data-frame-title>Viewer</span>
          <button type="button" data-close-frame aria-label="Close viewer">×</button>
        </div>
        <iframe data-frame title="Embedded document or media viewer" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </dialog>
      <dialog class="lightbox-dialog" data-lightbox>
        <div class="dialog-bar">
          <span class="mono" data-lightbox-title>Image</span>
          <div class="zoom-tools">
            <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
            <button type="button" data-zoom="reset">100%</button>
            <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
            <button type="button" data-lightbox-close aria-label="Close image viewer">×</button>
          </div>
        </div>
        <div class="lightbox-stage">
          <button class="lightbox-arrow prev" type="button" data-lightbox-prev aria-label="Previous image">←</button>
          <img data-lightbox-image alt="">
          <button class="lightbox-arrow next" type="button" data-lightbox-next aria-label="Next image">→</button>
        </div>
      </dialog>`;
  }

  window.PortfolioUI = {
    ancestorsOf,
    childrenOf,
    descendantsOf,
    dialogMarkup,
    documentType,
    driveThumb,
    esc,
    groupHref,
    imageMarkup,
    loadPortfolio,
    projectCard,
    projectHref,
    setupChrome,
    setupFrameDialog,
    setupLightbox,
    setupReveal,
    youtubeEmbed,
    youtubeId,
    youtubeThumb
  };
})();
