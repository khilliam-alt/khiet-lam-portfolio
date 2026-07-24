# Khiet Lam Portfolio

Public website: https://khilliam-alt.github.io/khiet-lam-portfolio/

## Edit without touching code

1. Open https://app.pagescms.org and sign in with GitHub.
2. Choose `khilliam-alt/khiet-lam-portfolio`.
3. Use **About and contact** for personal information.
4. Use **Five project desks — edit here** to update landing copy, hierarchy, articles, YouTube links, flipbooks, Drive previews, thumbnails and project media.
5. Cover and thumbnail fields open the Media picker directly. You can upload a new image there or select an existing image without copying its path.
6. Save. GitHub Pages publishes the update automatically.

## Information architecture

The public interface has five editorial desks:

1. Art Curator
2. Copywriting
3. Publishing
4. Talks & Interviews
5. Board Game Design

`data/editorial.json` preserves every Drive folder as a separate project record. `parentId` and `level` maintain the full pyramid, while the homepage and group landing pages present it as features, cards, columns and related stories.

SEO work is presented as a specialist desk inside Copywriting so the public navigation remains at five main groups.

## Media behaviour

- YouTube URLs render as embedded video.
- Toong Brochure uses the supplied Heyzine flipbook.
- The hormones ebook uses the supplied cover and the official Google Drive view-only preview.
- PDFs and Drive files open in an in-page viewer when permissions allow.
- Mixed portrait and landscape images use an uncropped editorial collage.
- Consistent image sets use a full-frame slider.
- Images open in a full-screen viewer with zoom controls.

Google Drive access and download restrictions remain controlled by the file owner. The website does not bypass those restrictions.
