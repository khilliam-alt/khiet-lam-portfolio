import fs from "node:fs";

const portfolioPath = new URL("../data/portfolio.json", import.meta.url);
const contentPath = new URL("../data/content.json", import.meta.url);
const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf8"));
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

const updates = {
  "khoi-goi-my-cam": {
    summary: "To understand is the beginning of love. Khơi Gợi Mỹ Cảm is a thematic series exploring the aesthetics of Vietnamese art, from the period before the École des Beaux-Arts de l’Indochine to the contemporary era.",
    article: "Created for younger audiences, the series builds an approachable path into Vietnamese art history and encourages a more personal sensitivity to the beauty of the country’s visual culture.\n\nResearcher Lý Đợi guides the programme, connecting historical context, close looking and conversation across different periods of Vietnamese art.",
    outcome: "A research led public programme that turns art history into an accessible, contemporary encounter for younger audiences.",
    tags: ["Vietnamese art", "Aesthetics", "Public programme", "Lý Đợi"]
  },
  "long-buom": {
    summary: "A project retracing Lọng Bướm, a distinctive decorative parasol once used by the An Nam people, through an interpretive reconstruction based on derivative sources rather than an original artefact or primary record.",
    article: "The project carefully distinguishes phỏng dựng from phục dựng: it proposes a new physical interpretation from secondary and derivative material, rather than claiming to restore an original object.\n\nResearchers and artists Khoa Phùng, Nghiêu Thiên and Lâm Ơi guided the process. Interviews, exhibition writing, press material, video and installation records document both the research and the public presentation.",
    outcome: "An interpretive reconstruction that makes a little known decorative object legible while remaining transparent about the limits of the surviving evidence.",
    tags: ["Interpretive reconstruction", "Material culture", "Exhibition", "Research"]
  },
  "don-ca-tai-tu": {
    title: "Đờn Ca Tài Tử Culture Class",
    summary: "A participatory cultural class introducing Đờn Ca Tài Tử through vọng cổ and the development of Southern Vietnamese cải lương.",
    article: "The class combines listening, musical context and guided discussion to make the relationship between Đờn Ca Tài Tử, vọng cổ and Southern cải lương easier to recognise.\n\nCurriculum, agenda, participant material and event photography preserve both the learning structure and the atmosphere of the programme.",
    outcome: "A complete class record connecting musical forms, historical context and an audience centred learning experience.",
    tags: ["Đờn Ca Tài Tử", "Vọng cổ", "Cải lương", "Culture class"]
  },
  "hat-boi-cultural-programme": {
    title: "Hát Bội Cultural Programme",
    summary: "A public programme introducing Hát Bội in relation to the performative and ceremonial world of Huế court music, Nhã nhạc cung đình Huế.",
    article: "The programme creates an accessible point of entry into classical Vietnamese performance through costume, gesture, music and live encounters.\n\nMore than thirty selected photographs document performers, staging, ceremonial detail and audience experience across multiple sessions.",
    outcome: "A substantial visual record of traditional performance presented as a living, audience facing cultural practice.",
    tags: ["Hát Bội", "Nhã nhạc", "Huế", "Performance"]
  },
  "vang-son-mot-thuo": {
    summary: "Một Thuở Vàng Son uses the language of sculpture to tell stories from tuồng, also known as Hát Bội.",
    article: "The exhibition translates the figures, gestures and dramatic memory of tuồng into sculptural form. Editorial framing, artist context and spatial planning help audiences move between traditional theatre and contemporary exhibition language.\n\nExhibition visuals, press material, artist documentation and display proposals are preserved together in this collection.",
    outcome: "A sculptural interpretation that carries the narrative world of tuồng into a contemporary exhibition setting.",
    tags: ["Sculpture", "Tuồng", "Hát Bội", "Exhibition"]
  },
  "nguoi-dom-hoa-giay": {
    summary: "A cultural exhibition dedicated to preserving and continuing the paper flower craft of Thanh Tiên village in Huế.",
    article: "The project follows the makers, materials and inherited knowledge behind Thanh Tiên paper flowers, treating the craft as a living practice rather than a nostalgic object.\n\nLanding page material and a full photographic record document the project from narrative development to exhibition and public encounter.",
    outcome: "An exhibition record that supports the continuity of a Huế craft village by centring its makers, techniques and cultural memory.",
    tags: ["Thanh Tiên", "Paper flowers", "Huế", "Craft heritage"]
  },
  "hat-boi-saigon-art-cruise": {
    summary: "A floating cultural programme that introduces Southern Vietnamese Hát Bội through research, dramaturgy and an audience friendly live narrative.",
    article: "Developed for Saigon Art Cruise, the programme brings classical theatre into a contemporary river journey. I shaped the curatorial framing, script and communication materials so that visual codes, character types and performance conventions could be followed by new audiences.\n\nThe collection includes visual direction, scripts, performance information, social content, video and event records.",
    outcome: "A layered public experience that connects Hát Bội research, live performance and accessible interpretation.",
    tags: ["Hát Bội", "Curatorial writing", "Live programme", "Saigon Art Cruise"]
  },
  "tranh-goi-vai": {
    summary: "A hands on culture class exploring the material language and traditional practice of fabric wrapped pictures.",
    article: "The programme invites participants to learn through making, bringing close attention to fabric, folding, composition and the cultural context of the form.\n\nThe collection preserves the project’s core visual communication and public facing framing.",
    outcome: "A compact learning format that translates a material tradition into an approachable making experience.",
    tags: ["Material culture", "Workshop", "Craft", "Public programme"]
  },
  "improv-kich-ung-tac": {
    summary: "An audience facing improvised theatre programme built around spontaneity, participation and the shared energy of live performance.",
    article: "Landing page copy and programme framing communicate the open, responsive nature of improvisation without over explaining the experience.\n\nEvent photography records the performers, audience interaction and changing rhythm of the live programme.",
    outcome: "Editorial framing and live documentation that present improvisation as an immediate, participatory cultural experience.",
    tags: ["Improvisation", "Theatre", "Event communication", "Audience"]
  }
};

const localCovers = {
  "exotrail-client-story": "media/covers/exotrail-client-story-cover.jpg",
  "film-criticism": "media/covers/film-criticism-cover.jpg",
  "lela-journal": "media/covers/lela-journal-cover.jpg",
  "tatler-vietnam": "media/covers/tatler-vietnam-cover.jpg",
  "e-magazine": "media/covers/e-magazine-cover.jpg",
  "artist-talks": "media/covers/artist-talks-cover.jpg"
};

for (const project of portfolio.projects) {
  if (updates[project.id]) Object.assign(project, updates[project.id]);
  if (localCovers[project.id]) project.cover = localCovers[project.id];
  if (project.id === "hidden-champions") {
    project.youtubeUrl ??= "";
    project.youtubeThumbnail ??= "";
    project.article = "The podcast writing process combined guest research, episode structure and conversational pacing.\n\nI developed research led questions and narrative pathways for more than ten episodes. Drive videos and production files remain available below; a YouTube URL can also be added in the portfolio editor to display an embedded video preview on this page.";
  }
}

portfolio.profileDocuments = [
  {
    title: "BA in Psychology",
    label: "Degree",
    sourceUrl: "https://drive.google.com/file/d/10cTv9p5wPZALB8gfzqCf5U2epexe0xUC/view",
    previewUrl: "https://drive.google.com/file/d/10cTv9p5wPZALB8gfzqCf5U2epexe0xUC/preview",
    thumbnail: "media/covers/ba-psychology-cover.jpg"
  },
  {
    title: "Curriculum Vitae",
    label: "CV",
    sourceUrl: "https://drive.google.com/file/d/1rh4FjvfOuGQkRgAWedE4XIwVoIaGwSYk/view",
    previewUrl: "https://drive.google.com/file/d/1rh4FjvfOuGQkRgAWedE4XIwVoIaGwSYk/preview",
    thumbnail: "media/covers/cv-cover.jpg"
  },
  {
    title: "Selected Works Portfolio",
    label: "Earlier portfolio",
    sourceUrl: "https://drive.google.com/file/d/1O0CekzlzF_WsMwN3JOYJ3lZ65Mlv41LF/view",
    previewUrl: "https://drive.google.com/file/d/1O0CekzlzF_WsMwN3JOYJ3lZ65Mlv41LF/preview",
    thumbnail: "media/covers/old-portfolio-cover.jpg"
  },
  {
    title: "Editorial and Translation Rate Card",
    label: "Rate card",
    sourceUrl: "https://drive.google.com/file/d/1aYSVwxMtw35BBjarCGUKo0uEVsrWaWX7/view",
    previewUrl: "https://drive.google.com/file/d/1aYSVwxMtw35BBjarCGUKo0uEVsrWaWX7/preview",
    thumbnail: "media/covers/rate-card-cover.jpg"
  }
];

content.site.about = "I am an editor, senior copywriter and cultural event curator based in Ho Chi Minh City. My practice moves between editorial research, publishing, brand language, interviews and public programmes. I am especially interested in making cultural knowledge and complex ideas clear, engaging and relevant to contemporary audiences.";

fs.writeFileSync(portfolioPath, `${JSON.stringify(portfolio, null, 2)}\n`);
fs.writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`);
