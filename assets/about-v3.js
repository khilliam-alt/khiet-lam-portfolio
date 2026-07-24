const {
  esc,
  loadPortfolio,
  setupChrome,
  setupFrameDialog,
  setupReveal
} = window.PortfolioUI;

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

function render(data) {
  const { profileDocuments, site } = data;
  document.querySelectorAll("[data-site-name]").forEach(node => node.textContent = site.name);
  document.querySelector("[data-about]").textContent = site.about;
  document.querySelector("[data-email]").href = `mailto:${site.email}`;
  document.querySelector("[data-email] span:first-child").textContent = site.email;
  document.querySelector("[data-phone]").href = `tel:${site.phone.replace(/\s/g, "")}`;
  document.querySelector("[data-phone] span:first-child").textContent = site.phone;
  document.querySelector("[data-linkedin]").href = site.linkedin;
  document.querySelector("[data-drive]").href = site.archiveUrl;
  document.querySelector("[data-portrait-primary]").src = site.portraitPrimary || "media/about-khiet-lam-color.jpg";
  document.querySelector("[data-portrait-secondary]").src = site.portraitSecondary || "media/about-khiet-lam-bw.jpg";
  document.querySelector("#profile-documents").innerHTML = profileDocuments.map(profileDocument).join("");

  setupFrameDialog();
  setupReveal();
  document.body.classList.add("is-ready");
}

setupChrome();
loadPortfolio().then(render).catch(error => {
  console.error(error);
  document.querySelector("#profile-documents").innerHTML = '<p class="load-error">The profile documents could not be loaded. Please refresh the page.</p>';
});
