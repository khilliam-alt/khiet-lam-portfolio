const esc = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const projectHref = id => `project.html?id=${encodeURIComponent(id)}`;

function collectionMarkup(category, projects, categoryIndex) {
  return `
    <section class="collection reveal" data-collection="${esc(category.id)}" data-index="0">
      <div class="collection-head">
        <span class="collection-index">${String(categoryIndex + 1).padStart(2, "0")} / 06</span>
        <h3>${esc(category.label)}</h3>
        <p>${esc(category.intro)}</p>
        <span class="collection-count">${projects.length} ${projects.length === 1 ? "project" : "projects"}</span>
        <div class="collection-controls" aria-label="${esc(category.label)} carousel controls">
          <button class="collection-arrow" type="button" data-direction="prev" aria-label="Previous project">←</button>
          <button class="collection-arrow" type="button" data-direction="next" aria-label="Next project">→</button>
        </div>
      </div>
      <div class="collection-window">
        <div class="collection-track">
          ${projects.map(project => `
            <article class="collection-card">
              <a class="collection-media" href="${projectHref(project.id)}" aria-label="Open ${esc(project.title)}">
                <img src="${esc(project.cover)}" alt="${esc(project.imageAlt || project.title)}" loading="lazy">
              </a>
              <div class="collection-body">
                <p class="collection-meta">${esc(project.client)} / ${esc(project.period)} / ${project.media?.length || 0} records</p>
                <h4><a href="${projectHref(project.id)}">${esc(project.title)}</a></h4>
                <p class="summary">${esc(project.summary)}</p>
                <a class="collection-link" href="${projectHref(project.id)}">Read article and collection</a>
              </div>
            </article>`).join("")}
        </div>
        <div class="collection-dots" aria-label="Choose project">
          ${projects.map((project, index) => `<button class="collection-dot${index === 0 ? " active" : ""}" type="button" data-slide="${index}" aria-label="Show ${esc(project.title)}"></button>`).join("")}
        </div>
      </div>
    </section>`;
}

function archiveMarkup(project, index, categories) {
  const category = categories.find(item => item.id === project.category);
  return `
    <article class="archive-row reveal" data-category="${esc(project.category)}">
      <span class="archive-number">${String(index + 1).padStart(2, "0")}</span>
      <a class="archive-thumb" href="${projectHref(project.id)}" aria-label="Open ${esc(project.title)}">
        <img src="${esc(project.cover)}" alt="" loading="lazy">
      </a>
      <div class="archive-title">
        <h3><a href="${projectHref(project.id)}">${esc(project.title)}</a></h3>
        <p class="mono">${esc(category?.short || project.category)} / ${esc(project.client)} / ${esc(project.period)}</p>
      </div>
      <p class="archive-summary"><strong>${esc(project.role)}.</strong> ${esc(project.summary)}</p>
      <div class="archive-links">
        <a href="${projectHref(project.id)}">Read more →</a>
        <a href="${esc(project.folderUrl)}" target="_blank" rel="noreferrer">Drive folder ↗</a>
      </div>
    </article>`;
}

function setCollectionIndex(collection, nextIndex) {
  const slides = collection.querySelectorAll(".collection-card");
  if (!slides.length) return;
  const index = (nextIndex + slides.length) % slides.length;
  collection.dataset.index = String(index);
  collection.querySelector(".collection-track").style.transform = `translateX(-${index * 100}%)`;
  collection.querySelectorAll(".collection-dot").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
}

function setupCollections() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-collection]").forEach(collection => {
    collection.dataset.paused = "false";
    collection.querySelectorAll("[data-direction]").forEach(button => button.addEventListener("click", () => {
      const current = Number(collection.dataset.index || 0);
      setCollectionIndex(collection, current + (button.dataset.direction === "next" ? 1 : -1));
    }));
    collection.querySelectorAll("[data-slide]").forEach(button => button.addEventListener("click", () => setCollectionIndex(collection, Number(button.dataset.slide))));
    collection.addEventListener("mouseenter", () => collection.dataset.paused = "true");
    collection.addEventListener("mouseleave", () => collection.dataset.paused = "false");
    collection.addEventListener("focusin", () => collection.dataset.paused = "true");
    collection.addEventListener("focusout", () => collection.dataset.paused = "false");
    if (!reduced && collection.querySelectorAll(".collection-card").length > 1) {
      setInterval(() => {
        if (collection.dataset.inView === "true" && collection.dataset.paused !== "true" && !document.hidden) {
          setCollectionIndex(collection, Number(collection.dataset.index || 0) + 1);
        }
      }, 5200 + Number(collection.querySelector(".collection-index")?.textContent?.slice(0, 2) || 0) * 180);
    }
  });
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    nodes.forEach(node => { node.classList.add("is-visible"); node.dataset.inView = "true"; });
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.dataset.inView = String(entry.isIntersecting);
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  }), {threshold: .12, rootMargin: "0px 0px -6%"});
  nodes.forEach(node => observer.observe(node));
}

function setupChrome() {
  if (!document.querySelector(".scroll-progress")) document.body.insertAdjacentHTML("afterbegin", '<div class="scroll-progress" aria-hidden="true"></div>');
  const hero = document.querySelector(".hero");
  const progress = document.querySelector(".scroll-progress");
  const header = document.querySelector(".site-header");
  let ticking = false;
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
    hero?.style.setProperty("--hero-shift", Math.min(scrollY, 900));
    header?.classList.toggle("scrolled", scrollY > 16);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, {passive:true});
  update();

  const ticker = `
    <div class="divider-ticker" aria-hidden="true"><div class="divider-ticker-track">
      ${Array.from({length:2}, () => '<span>Research <i>✦</i> Writing <i>✦</i> Curation <i>✦</i> Interviews <i>✦</i> Publishing <i>✦</i> Visual Direction <i>✦</i> SEO Content <i>✦</i> Play</span>').join("")}
    </div></div>`;
  document.querySelector(".hero")?.insertAdjacentHTML("afterend", ticker);
}

function applyFilter(filter) {
  document.querySelectorAll(".archive-row").forEach(row => row.hidden = filter !== "all" && row.dataset.category !== filter);
  document.querySelectorAll(".filter").forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function render(siteData, portfolio) {
  const site = siteData.site;
  const {categories, projects} = portfolio;
  const counts = Object.fromEntries(categories.map(category => [category.id, projects.filter(project => project.category === category.id).length]));

  document.querySelectorAll("[data-site-name]").forEach(node => node.textContent = site.name);
  document.querySelector("[data-eyebrow]").textContent = site.eyebrow;
  document.querySelector("[data-headline]").textContent = site.headline;
  document.querySelector("[data-intro]").textContent = site.intro;
  document.querySelector("[data-about]").textContent = site.about;
  document.querySelector("[data-cv-link]").href = site.cvUrl;
  document.querySelector("[data-email]").textContent = site.email;
  document.querySelector("[data-email-link]").href = `mailto:${site.email}`;
  document.querySelector("[data-phone]").textContent = site.phone;
  document.querySelector("[data-phone-link]").href = `tel:${site.phone.replace(/\s/g, "")}`;
  document.querySelector("[data-linkedin-link]").href = site.linkedin;
  document.querySelector("[data-archive-link]").href = site.archiveUrl;

  const practiceNote = document.querySelector(".practice-head span");
  if (practiceNote) practiceNote.textContent = "fields";
  document.querySelector("#discipline-list").innerHTML = categories.map((category, index) => `
    <a class="discipline" href="#archive" data-filter-link="${esc(category.id)}">
      <span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(category.label)}</strong><small>${counts[category.id]}</small>
    </a>`).join("");

  const featured = document.querySelector("#featured");
  featured.querySelector(".eyebrow").textContent = "Featured / Six moving collections";
  featured.querySelector("h2").innerHTML = 'Each field has its own <em>body of work.</em>';
  document.querySelector("#featured-grid").innerHTML = `<div class="collection-stack">${categories.map((category, index) => collectionMarkup(category, projects.filter(project => project.category === category.id), index)).join("")}</div>`;

  document.querySelector("#archive-list").innerHTML = projects.map((project, index) => archiveMarkup(project, index, categories)).join("");
  const filterItems = [{id:"all",label:`All (${projects.length})`}, ...categories.map(category => ({id:category.id,label:`${category.short} (${counts[category.id]})`}))];
  document.querySelector("#filters").innerHTML = filterItems.map((item, index) => `<button class="filter${index === 0 ? " active" : ""}" type="button" data-filter="${esc(item.id)}" aria-pressed="${index === 0}">${esc(item.label)}</button>`).join("");

  document.querySelectorAll("img").forEach(image => image.addEventListener("error", () => image.closest("a, div")?.classList.add("image-failed"), {once:true}));
  document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
  document.querySelectorAll("[data-filter-link]").forEach(link => link.addEventListener("click", () => applyFilter(link.dataset.filterLink)));
  setupCollections();
  setupReveal();
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

setupChrome();
Promise.all([
  fetch(`data/content.json?v=${Date.now()}`).then(response => { if (!response.ok) throw new Error("Site content unavailable"); return response.json(); }),
  fetch(`data/portfolio.json?v=${Date.now()}`).then(response => { if (!response.ok) throw new Error("Portfolio unavailable"); return response.json(); })
]).then(([siteData, portfolio]) => render(siteData, portfolio)).catch(error => {
  console.error(error);
  document.querySelector("#featured-grid").innerHTML = '<p class="error">The collections could not be loaded. Please refresh the page.</p>';
  document.querySelector("#archive-list").innerHTML = '<p class="error">The archive is temporarily unavailable.</p>';
});
