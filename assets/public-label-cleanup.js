(() => {
  const selectors = [
    ".site-nav a",
    ".group-hero .eyebrow",
    ".group-index-section h2",
    ".project-pager strong",
    ".error-page h1",
    ".loading-page .eyebrow"
  ];

  const stripDesk = text => String(text || "")
    .replace(/\bdesk\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\//g, " /")
    .trim();

  const clean = () => {
    document.querySelectorAll(selectors.join(",")).forEach(node => {
      const next = stripDesk(node.textContent);
      if (next !== node.textContent) node.textContent = next;
    });
  };

  clean();
  const observer = new MutationObserver(clean);
  observer.observe(document.body, { childList: true, subtree: true });
})();
