import fs from "node:fs";

const current = JSON.parse(fs.readFileSync(new URL("../data/portfolio.json", import.meta.url), "utf8"));
const old = new Map(current.projects.map(project => [project.id, project]));

const driveFolder = id => `https://drive.google.com/drive/folders/${id}`;
const driveView = id => `https://drive.google.com/file/d/${id}/view`;
const drivePreview = id => `https://drive.google.com/file/d/${id}/preview`;
const driveThumb = (id, size = "w2000") => `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;

function media(id, title, type = "image", mime = "image/jpeg", url = null) {
  return {
    id,
    title,
    type,
    mime,
    sourceUrl: url || driveView(id),
    previewUrl: drivePreview(id),
    thumbnail: driveThumb(id)
  };
}

function node({
  id,
  title,
  group,
  parentId = null,
  level = 1,
  folderId,
  source = id,
  cover,
  coverId,
  role,
  client,
  period,
  summary,
  outcome,
  article,
  tags,
  featured = false,
  youtubeUrl,
  flipbookUrl,
  embedUrl,
  directMedia,
  editorialLabel
}) {
  const inherited = old.get(source) || {};
  const resolvedCover = cover || (coverId ? driveThumb(coverId) : inherited.cover);
  return {
    ...inherited,
    id,
    title,
    group,
    category: group,
    parentId,
    level,
    folderId,
    folderUrl: driveFolder(folderId),
    cover: resolvedCover,
    image: resolvedCover,
    role: role || inherited.role || "Editor and Writer",
    client: client || inherited.client || "Selected work",
    period: period || inherited.period || "Selected work",
    summary: summary || inherited.summary || "A selected project from my editorial and cultural practice.",
    outcome: outcome || inherited.outcome || "The complete working record is available through the linked project files.",
    article: article || inherited.article || "",
    tags: tags || inherited.tags || [],
    featured,
    youtubeUrl: youtubeUrl || inherited.youtubeUrl || "",
    youtubeThumbnail: youtubeUrl ? undefined : inherited.youtubeThumbnail,
    flipbookUrl: flipbookUrl || "",
    embedUrl: embedUrl || "",
    media: directMedia || inherited.media || [],
    editorialLabel: editorialLabel || "",
    published: true
  };
}

const groups = [
  {
    id: "curation",
    number: "01",
    title: "Art Curator",
    short: "Curation",
    kicker: "Research, dramaturgy and public culture",
    intro: "I develop exhibitions, cultural classes and public programmes that make Vietnamese art and performance histories approachable without flattening their complexity.",
    folderId: "1CeAXBCQnUoQ_1h4ZtfuANiP4V0phl9C8",
    leadProject: "hat-boi-saigon-art-cruise",
    accent: "#8b352f",
    showcase: [
      { type: "youtube", title: "Saigon Art Cruise", projectId: "hat-boi-saigon-art-cruise", url: "https://youtu.be/5uwuvQ3tbpQ" },
      { type: "pdf", title: "Nghệ Văn Thực Nghiệm Proposal", fileId: "1wKEX8nVr-g1vKYKoCWvPtFHKikP-jgVU", cover: driveThumb("1lR7pqz-zhYa_uq6u3y2qDhJE8xLmAm3W") },
      { type: "project", title: "Lọng Bướm", projectId: "long-buom" }
    ]
  },
  {
    id: "copywriting",
    number: "02",
    title: "Copywriting",
    short: "Brand desk",
    kicker: "Brand voice, launches and editorial systems",
    intro: "I shape brand language across campaigns, launches, social media, internal communication, email marketing, interviews and spatial storytelling.",
    folderId: "1WVKafOrZ6z6ZkMmFBJjfWGOk1xDCVOep",
    leadProject: "toong-launching",
    accent: "#1f5142",
    showcase: [
      { type: "youtube", title: "TVC Thi Sách", projectId: "toong-tvc", url: "https://youtu.be/LcNO0ExpAys" },
      { type: "flipbook", title: "Toong Brochure 2025", projectId: "toong-launching", url: "https://heyzine.com/flip-book/d33693a345.html", cover: driveThumb("1gdAQz54y4XAD5F70T_z-OUz0QRncBXRP") },
      { type: "project", title: "Clientele Interview", projectId: "toong-clientele-interviews" }
    ]
  },
  {
    id: "publishing",
    number: "03",
    title: "Publishing",
    short: "Publishing desk",
    kicker: "Books, journalism and long form",
    intro: "My publishing work moves from reported culture writing and criticism to book editing, translation, fiction development and accessible health education.",
    folderId: "1spJsJzz4Fh6RWytlDiTXS3MOLmXlCg77",
    leadProject: "hormones-ebook",
    accent: "#a94b2d",
    showcase: [
      { type: "drive", title: "Làm Hòa Với Hormones, Làm Bạn Với Chu Kỳ", projectId: "hormones-ebook", url: drivePreview("1f_dsNQrAyPh4nxWftTfsR-qZ7jIuzFo4"), cover: "media/covers/hormones-ebook-cover.jpg" },
      { type: "pdf", title: "Tatler Vietnam — selected article", projectId: "tatler-vietnam", fileId: "15Doxzp3ZL5ykFN33vXJOaBcpv5RbZFB-", cover: "media/covers/tatler-vietnam-cover.jpg" },
      { type: "project", title: "Books Editing", projectId: "van-lang-books" }
    ]
  },
  {
    id: "interviews",
    number: "04",
    title: "Talks & Interviews",
    short: "Conversation desk",
    kicker: "Research led questions and human conversations",
    intro: "I research people and ideas, then write interview structures and podcast scripts that let expertise arrive in a clear, human voice.",
    folderId: "1Pbs65EGoBX-42NlLXLam6pBFzz5EyzmI",
    leadProject: "hidden-champions",
    accent: "#60445c",
    showcase: [
      { type: "youtube", title: "MC Phan Tô Ny", projectId: "podcast-phan-to-ny", url: "https://www.youtube.com/watch?v=1fneL_GGvGs" },
      { type: "youtube", title: "MC Nguyên Khang", projectId: "podcast-nguyen-khang", url: "https://www.youtube.com/watch?v=lZpcG-NGUBA" },
      { type: "collection", title: "Creative Director Dzũng Yoko", projectId: "podcast-dzung-yoko" }
    ]
  },
  {
    id: "board-game",
    number: "05",
    title: "Board Game Design",
    short: "Play desk",
    kicker: "Folklore, systems and playful narratives",
    intro: "A personal design practice where Vietnamese folklore becomes a playable narrative system through characters, rules and visual world building.",
    folderId: "1CUaJgRthAoHyqlT0nr22lqHrc3CYHkCg",
    leadProject: "cuoc-dua-dau-thai",
    accent: "#6c3f23",
    showcase: [
      { type: "project", title: "Cuộc Đua Đầu Thai", projectId: "cuoc-dua-dau-thai" },
      { type: "pdf", title: "Project document", projectId: "cuoc-dua-dau-thai", fileId: "1Zx47v7y9X3l3sj9Qo5pqELV1FC6xhhhF", cover: driveThumb("1zwguVQLtYJ5iP8eSVIr-kZX-9eX8NV-4") }
    ]
  }
];

const projects = [
  node({
    id: "hat-boi-saigon-art-cruise", title: "Saigon Art Cruise", group: "curation", level: 1,
    folderId: "1p_icPZ1g8P6Uu2Cki3RoNhfvhhaDHdwp", source: "hat-boi-saigon-art-cruise", featured: true,
    youtubeUrl: "https://youtu.be/5uwuvQ3tbpQ",
    editorialLabel: "Lead feature"
  }),
  node({
    id: "saigon-art-cruise-visual-direction", title: "Saigon Art Cruise — Visual Direction", group: "curation",
    parentId: "hat-boi-saigon-art-cruise", level: 2, folderId: "1l1Nv-TqQHMfqTwf7-AU7xXLZYeQhatxp",
    coverId: "1lR7pqz-zhYa_uq6u3y2qDhJE8xLmAm3W", role: "Visual Editor and Curator", client: "Ngay Xua Asia",
    period: "2025 to present", summary: "A visual record shaping how the performances, artists and river setting of Saigon Art Cruise are seen as one cultural experience.",
    outcome: "Photography and visual assets were edited into a coherent public facing identity for the programme.",
    tags: ["Visual direction", "Curation", "Photography"],
    directMedia: [
      media("1YmWowYiAGSYX06q-c7WInTtHlg2l_7ml", "Visual direction 02"),
      media("1oOnfLiN430UMTtGVY2kjoLfjA1G3hgYv", "Visual direction 01"),
      media("1InxF-zK1OUdN8lQCXgh5GFd-OOr3jUIT", "Saigon Art Cruise 13"),
      media("172azGhJIi2HfE40FhSVikp3BmKDIckjj", "Saigon Art Cruise 16"),
      media("1aMsJOPF_SOvbChM6x4m_Pni-PgUvc0CS", "Saigon Art Cruise 20"),
      media("13eC0oEZakTA93dtibuU61SOxhaSa51iN", "Performance record 281"),
      media("1F30ykHJBdcozm2jhNQ1tO9IbXjAOTvVM", "Performance portrait")
    ]
  }),
  node({
    id: "saigon-art-cruise-script", title: "Saigon Art Cruise — Scripts", group: "curation",
    parentId: "hat-boi-saigon-art-cruise", level: 2, folderId: "1WZOcAV2FNf4I6vUIZ23ZPLtxGoqjICaa",
    coverId: "1jfrr0JkeIEMKKKj4lB4ODy2q821i9pCC", role: "Researcher and Scriptwriter", client: "Ngay Xua Asia",
    period: "2025 to present", summary: "Performance scripts translating historical material into a live narrative for audiences aboard the Saigon Art Cruise.",
    outcome: "Two complete script records connect historical research with dramaturgy and stage delivery.",
    tags: ["Script", "Dramaturgy", "Research"],
    directMedia: [
      media("18qm-92Evz0UktwIrYFihbAgBxk0PCD3y", "Trần Hưng Đạo — Bạch Đằng Giang", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1qDhdk8s7xVVZpgZyibrrckHE8UrscWEX", "Tiết Giao Đoạt Ngọc", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ]
  }),
  node({ id: "khoi-goi-my-cam", title: "Khơi Gợi Mỹ Cảm", group: "curation", level: 1, folderId: "1Ry0nHta3N_EKjF0S82iod9J0ohCE4Bri", featured: true }),
  node({ id: "don-ca-tai-tu", title: "Đờn Ca Tài Tử", group: "curation", level: 1, folderId: "1SX0DIhzIgNnOBHO2kwz0AKp0dDktrBdu" }),
  node({ id: "tranh-goi-vai", title: "Tranh Gói Vải", group: "curation", level: 1, folderId: "1Cch97QWezphTO0On2ac-A9l58rQ1CTKu" }),
  node({ id: "improv-kich-ung-tac", title: "Improv Kịch Ứng Tác", group: "curation", level: 1, folderId: "1hfrb0-uU_sY3RRxDhYBHUaKVKCVlUqs3" }),
  node({ id: "long-buom", title: "Lọng Bướm", group: "curation", level: 1, folderId: "1fZzAVAmbg0NjQibe1LuM88uDO8m1vbGA", featured: true }),
  node({
    id: "long-buom-interviews", title: "Lọng Bướm — Artist Interviews", group: "curation",
    parentId: "long-buom", level: 2, folderId: "1GQXm3XJY8ZVTN1Oc9DDDJKYBUZ6XF_0Y",
    coverId: "1YINjwcc92ZX2ZzPunX32pbsOom0-GkiD", role: "Interview Researcher and Writer", client: "Ngay Xua Asia",
    period: "2025", summary: "Interview research with Khoa Phùng, Nghiêu Thiên and Lâm Ơi for the interpretive reconstruction of Lọng Bướm.",
    outcome: "Questions and expert responses make the research process visible alongside the finished exhibition narrative.",
    tags: ["Interview", "Material culture", "Research"],
    directMedia: [
      media("1xPteJN0XUjTU_yeQ52fvxmx4ZLH2Gxcf", "19 câu hỏi phỏng vấn nghệ sĩ làm lọng", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("13EhcODidYACNvKjuRFeGr3m_f4IJaWTc", "Trần Ngọc Nhật (Nghiêu Thiên)", "pdf", "application/pdf"),
      media("1x5o4hfnVafRa6YvwL8R_pEAipRu9_bdH", "Câu trả lời của Lâm", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ]
  }),
  node({ id: "nguoi-dom-hoa-giay", title: "Người Đơm Hoa Giấy", group: "curation", level: 1, folderId: "1eNyoEUfIg8vmXci-D45ZfYOgKnhPyspN" }),
  node({ id: "vang-son-mot-thuo", title: "Một Thuở Vàng Son", group: "curation", level: 1, folderId: "1Lqjdz3h1u74IxgjZ7MVXznSFQCBus9W0" }),
  node({ id: "hat-boi-cultural-programme", title: "Hát Bội & Nhã Nhạc Cung Đình Huế", group: "curation", level: 1, folderId: "13tpf0Akql_2owMfYuxM44G4wbNAUoV3j" }),

  node({
    id: "toong-launching", title: "Toong Launching", group: "copywriting", level: 1,
    folderId: "1cNP29ipil7q--gG7GTDPoDw2xHALUozG", source: "toong-brand-copywriting", featured: true,
    coverId: "1gdAQz54y4XAD5F70T_z-OUz0QRncBXRP", role: "Senior Copywriter and Brochure Editor", client: "Toong",
    period: "2024 to 2025", summary: "Launch communication for Thi Sách and The Global City across factsheets, campaign copy and the 2025 corporate brochure.",
    outcome: "I wrote and edited launch materials, and proofread the linked Toong Brochure 2025 before publication.",
    flipbookUrl: "https://heyzine.com/flip-book/d33693a345.html",
    directMedia: [
      media("1gdAQz54y4XAD5F70T_z-OUz0QRncBXRP", "Factsheet Thi Sách — English"),
      media("1pwSnoOFeswZI4ufFBXZUFb5pjHbkQlhR", "Factsheet The Global City — English"),
      media("1ZdDHt9gf5EV9eGllwHX6NMZ7hZ-hH_Sg", "Toong Brochure 2025", "pdf", "application/pdf")
    ]
  }),
  node({
    id: "toong-tvc", title: "Toong TVC", group: "copywriting", level: 1,
    folderId: "1i4OLE3SL3eEG4_V5rNcLrhbeBneD27TT", featured: true,
    coverId: "1BhYXc3nupGltMF6aXNhNQ4gswAtAkHJL", role: "TVC Scriptwriter", client: "Toong",
    period: "2024 to 2025", summary: "Video scripts for the Thi Sách and The Global City launches, developed from place narratives into concise audiovisual storytelling.",
    outcome: "The project includes teaser and TVC scripts, a final Drive video and the public Thi Sách film.",
    youtubeUrl: "https://youtu.be/LcNO0ExpAys",
    tags: ["TVC", "Script", "Launch"],
    directMedia: [
      media("1pP3GTjgAcGjJ8ImMii7oG1vuPYgbvAx6", "Kịch bản teaser Thi Sách", "pdf", "application/pdf"),
      media("1MRIQfzFi34LE9B_b7M5SzqyZV_XUZOSZ", "Kịch bản TVC Toong The Global City", "pdf", "application/pdf"),
      media("1cCje8GPEW1C9rGBFLM6ZJYw6hoXjYXwX", "Thi Sách — final English subtitle", "video", "video/mp4")
    ]
  }),
  node({
    id: "toong-clientele-interviews", title: "Clientele Interviews", group: "copywriting", level: 1,
    folderId: "1Ad05nAZ8q_COz7KejpWyrQC2kB6FGcXQ", coverId: "16gEKBvTcpspEEHkKM9wrrBevF4-Aani4",
    role: "Interviewer and Copywriter", client: "Toong", period: "2024 to 2025",
    summary: "A series of business client stories built from research, interviews and portrait led editorial narratives.",
    outcome: "The series presents Kengur, Keyrus and ExoTrail as distinct human stories rather than generic corporate testimonials.",
    tags: ["B2B interview", "Client story", "Copywriting"]
  }),
  node({ id: "kengur-client-story", title: "Kengur Client Story", group: "copywriting", parentId: "toong-clientele-interviews", level: 2, folderId: "1ObLKeoyolHP2hcKKsUcCJjYEz7U_2x78" }),
  node({ id: "keyrus-client-story", title: "Keyrus Client Story", group: "copywriting", parentId: "toong-clientele-interviews", level: 2, folderId: "1A5cjom6iYNxQjLO7raMnkh1Nj5tf6qJM" }),
  node({ id: "exotrail-client-story", title: "ExoTrail Client Story", group: "copywriting", parentId: "toong-clientele-interviews", level: 2, folderId: "1UnwB_dJSsmdm8soZjwCcdsL79bVx6TM7" }),
  node({
    id: "toong-visual-direction", title: "Visual Direction", group: "copywriting", level: 1,
    folderId: "1KWq8f7LE7Nj-fhSp4finwJxu_E_GSp7V", coverId: "1NCr5NvymA0M8x-Ki8jmGymO07TX0a4kW",
    role: "Editorial and Visual Direction", client: "Toong", period: "2024 to 2025",
    summary: "A visual editorial system spanning locations, launches, pop ups and exhibitions across the Toong brand.",
    outcome: "Eight location and campaign collections are organised as individual visual stories within one brand desk.",
    tags: ["Visual direction", "Brand", "Place"]
  }),
  node({ id: "toong-cong-hoa", title: "Toong Cộng Hòa", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1M2FdoVRLYksFR92M0Ks6_Y0muVGW7ygz" }),
  node({ id: "toong-ha-noi", title: "Toong Hà Nội", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1rd3WI1bn5Qe7VBbYVwPrxkwI1TUqusEU" }),
  node({ id: "toong-minh-khai", title: "Toong Nguyễn Thị Minh Khai", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1eDUFkX1R7lAxCaMEakCEQokO1alwbC7R" }),
  node({ id: "toong-pham-ngoc-thach", title: "Toong Phạm Ngọc Thạch", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1JzLklBLQ8zHHMd_zEmfkYxAErd04rNN4" }),
  node({ id: "toong-thi-sach-launch", title: "Launching — Thi Sách", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1-oZueCykN7i79Q_ZdsxWHVEq7GUEuGie", youtubeUrl: "https://youtu.be/LcNO0ExpAys" }),
  node({ id: "toong-global-city", title: "Launching — The Global City", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1v6Qzn3zIesiFJc0UMCs71bBV09f8B0kW" }),
  node({
    id: "toong-popup", title: "Toong Pop Up", group: "copywriting", parentId: "toong-visual-direction", level: 2,
    folderId: "1WJ6fyrb6EY_wnZ8VIHWb-lTrVIqWoezB", coverId: "1FOU3UpLJGWexk4odm6LPiT5AgUllu7us",
    role: "Editorial and Visual Direction", client: "Toong", period: "2024 to 2025",
    summary: "Pop up spaces and temporary activations documented through a flexible visual language.",
    outcome: "A mixed image collection records temporary spaces, people and brand activity without forcing unlike formats into a single crop.",
    tags: ["Pop up", "Photography", "Visual direction"],
    directMedia: [
      media("1FOU3UpLJGWexk4odm6LPiT5AgUllu7us", "Pop up record 01"),
      media("1mgFdziVcntvxP-FtytHzm7JyRkIrhAXS", "Toong pop up 01"),
      media("19T5lqR7fgVnZDMDp4fkVrnMFSbtFZoDK", "Toong pop up 02"),
      media("1Z_6fHBCPzN2ldUiNVGoc3EYKdetZvJzM", "Pop up event 24"),
      media("1dJLN6Wv33jkJl-432Kmu26govLaLYS_9", "Pop up event 03")
    ]
  }),
  node({ id: "toong-noi-exhibition", title: "Triển Lãm Nối", group: "copywriting", parentId: "toong-visual-direction", level: 2, folderId: "1lDFMfurOGhKKJ1YqBKSfjfY2JbL1xmAW" }),
  node({
    id: "mybest-seo", title: "SEO Editorial for Mybest.vn", group: "copywriting", level: 1,
    folderId: "1jjJSMkK6DKbJclTfEj9S7YFliaSJPUEX", source: "mybest-seo", editorialLabel: "SEO desk"
  }),

  node({
    id: "hormones-ebook", title: "Làm Hòa Với Hormones, Làm Bạn Với Chu Kỳ", group: "publishing", level: 1,
    folderId: "1Q2WWqa8Ei5ETbWW8zGa0FCZhsKWAqvsd", cover: "media/covers/hormones-ebook-cover.jpg",
    featured: true, embedUrl: drivePreview("1f_dsNQrAyPh4nxWftTfsR-qZ7jIuzFo4")
  }),
  node({ id: "publishing-proposals", title: "Proposal Writing", group: "publishing", level: 1, folderId: "1Bn9UC_dbFyvP2AmEMR2sv2hnhbyic9iP" }),
  node({ id: "fiction-editorial", title: "Fictions", group: "publishing", level: 1, folderId: "1-Fj-YTKKHWb3fhMQDlrZ_x53vM4i-ORt", featured: true }),
  node({
    id: "fiction-writing-guides", title: "Fiction Writing Guides", group: "publishing", parentId: "fiction-editorial", level: 2,
    folderId: "17RtuGqwpMjZC8TQbx34OQJbJVIEY6jBK", cover: old.get("fiction-editorial")?.cover,
    role: "Novel Editor and Writing Instructor", client: "NovelToon", period: "2020 to 2022",
    summary: "Practical editorial guides on dialogue, genre criteria, story structure and Vietnamese language for serial fiction writers.",
    outcome: "Nine working documents turn recurring editorial feedback into reusable guidance for writers.",
    tags: ["Writing education", "Fiction", "Editorial"],
    directMedia: [
      media("1ddnpkFiuhMAq9Xq2cmvwhtOpZa14EH-a", "Định dạng hội thoại", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1Mo7JVcQEGrxTtPiksE81_m9m8189_LWm", "4 tips xây dựng hội thoại", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1NFj_sc6pNnZE8O8Ki4tkfntFBzoMW8d0", "Phương pháp viết ngôn tình hiện đại", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1x_NNOY8RIFfBEaYTapgCq2KVQ5rnRSMe", "Tiêu chí chọn đề cương đam mỹ", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1y-lkrAsdE5F2_n9eHUYTV9-NY50WlAqW", "The Shape of Water — another view", "pdf", "application/pdf")
    ]
  }),
  node({
    id: "fiction-social-media", title: "Fiction Social Media Plan", group: "publishing", parentId: "fiction-editorial", level: 2,
    folderId: "1OrZbAemmdvioCnHrqAU0zGiSmc0gXyOV", cover: old.get("fiction-editorial")?.cover,
    role: "Editorial Planner", client: "NovelToon", period: "2020 to 2022",
    summary: "Content, promotion and publishing plans connecting fiction discovery with reader communities.",
    outcome: "Planning sheets document publishing principles, advertising copy and the editorial calendar.",
    tags: ["Content planning", "Community", "Publishing"],
    directMedia: [
      media("1gf_tHDAYKtskjgPLLPaTOderMQQL2AeT", "Nguyên tắc đăng bài", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1nIVS7buRTr2srohtxx2pA3iCclvint_H", "PR and Ads", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("11LDkC8jP9elF9H72BH1QbOWJ1Pql_8iR", "Content Plan", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1OoaC0L7iKB8S5ZvxCnAi6Oz4fsb-Qr3K", "Giới thiệu truyện để chạy ads", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ]
  }),
  node({
    id: "fiction-adaptation", title: "Adaptation & Script", group: "publishing", parentId: "fiction-editorial", level: 2,
    folderId: "1PQRjTfYndPxS4RmPlVda6nhJwiUXgV7w", cover: old.get("fiction-editorial")?.cover,
    role: "Adaptation Editor and Scriptwriter", client: "NovelToon", period: "2020 to 2022",
    summary: "Character dossiers, world building sheets and adaptation scripts for serial fiction.",
    outcome: "A working production record connects source fiction, adaptation decisions and structured screen ready scripts.",
    tags: ["Adaptation", "Script", "Fiction"],
    directMedia: [
      media("1C-Mg-o3jXDp5ZOE748aMJMMNBRTiRiJ_", "Hồ sơ nhân vật phụ Phương Tiên Sinh", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1tyWzyZKJuYqFJNelqcChEIIHNCNef-rt", "Hồ sơ background Phương Tiên Sinh", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1Rv2_i0qckhA9GbofOwG4PqHsockEKqRM", "Kịch bản chuyển thể Phương Tiên Sinh", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1D1wRAuiD2y9odcbiVkc5s0cjsX3AkdSL", "Form kịch bản", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ]
  }),
  node({
    id: "fiction-assessment", title: "Fiction Assessment & Criteria", group: "publishing", parentId: "fiction-adaptation", level: 3,
    folderId: "1ddneoJqOt3-6gY_4KEh3--CRtjCxjeOW", cover: old.get("fiction-editorial")?.cover,
    role: "Novel Editor and Assessor", client: "NovelToon", period: "2020 to 2022",
    summary: "Assessment frameworks for genre, outlines and story quality used to evaluate and develop serial fiction.",
    outcome: "Scoring samples, criteria and genre definitions made editorial decisions more consistent and teachable.",
    tags: ["Assessment", "Editorial criteria", "Fiction"],
    directMedia: [
      media("1gH96UEjrb9pGx0rBtAXa3ZEtqfloUgVk", "Tiêu chí đánh giá đam bách", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1i_2-Q8NEHniG5buXB7pKlGo5Kh-d31ai", "Tiêu chí đánh giá tác phẩm", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1rSuueiWbfHYuKw3xZiTVsqcjObi9OgGx", "Sample chấm điểm truyện", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1_pcOuMNnyW5vY_tE6fkP0vZ5xARQcdzu", "Định nghĩa thể loại và phân tag truyện", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ]
  }),
  node({
    id: "fiction-training-materials", title: "Training Materials", group: "publishing", parentId: "fiction-assessment", level: 4,
    folderId: "1OVuSPNyvMcXnfEjC7FJ46_de742BIUgl", cover: old.get("fiction-editorial")?.cover,
    role: "Facilitator and Curriculum Writer", client: "NovelToon", period: "2020 to 2022",
    summary: "Training materials for new and developing authors, spanning curriculum, exercises and quality improvement plans.",
    outcome: "Six programme documents supported structured author development at different experience levels.",
    tags: ["Training", "Curriculum", "Author development"],
    directMedia: [
      media("1JxnNPveG6dWF0b1dWMEzh0Sof01xvKS7", "Khóa huấn luyện tác giả", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1RYsGhfwy1I608xb-064vajR6x_vzoJiB", "Giáo trình huấn luyện tác mới", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      media("1V7p0KcasSGPmbnvCmMle01iY2HjM4wOu", "Khóa đào tạo tác mới", "document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      media("1ZVn8b4tLx-i8Nh7PZL4BDtODhs6HbqaZ", "Khóa đào tạo tác Top và Giữa", "document", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ]
  }),
  node({ id: "film-criticism", title: "Film Critics", group: "publishing", level: 1, folderId: "101SSWOUCq39-01yrzdTwqaBxUyZu-Asd" }),
  node({
    id: "articles-essays", title: "Articles & Essays", group: "publishing", level: 1,
    folderId: "1rHoK2XP_xpkZcORFr1GruKi2hy6_VRrl", cover: "media/covers/tatler-vietnam-cover.jpg",
    role: "Journalist and Contributing Writer", client: "Lela Journal and Tatler Vietnam", period: "2023 to present",
    summary: "A publishing desk for reported features, profiles, interviews and cultural essays across Lela Journal and Tatler Vietnam.",
    outcome: "Two publication archives keep long form work readable as complete article records.",
    tags: ["Journalism", "Cultural writing", "Long form"]
  }),
  node({ id: "lela-journal", title: "Lela Articles", group: "publishing", parentId: "articles-essays", level: 2, folderId: "1Nyx21aHgIrYO_tcTcLFB2f02chwtT_at" }),
  node({ id: "tatler-vietnam", title: "Tatler Articles", group: "publishing", parentId: "articles-essays", level: 2, folderId: "1vLtndaAR3XmDJ7wsLfsT4SEz7s3Dl8fa", featured: true }),
  node({ id: "e-magazine", title: "E Magazine", group: "publishing", level: 1, folderId: "1Wfv0PpDPJqKO-WvQTGjZ4a05cEQx5-DF" }),
  node({ id: "translated-books", title: "Translated Books", group: "publishing", level: 1, folderId: "1zTPb-WkzsaM97i8dxAFWBaVFWH-bN6Bd" }),
  node({ id: "van-lang-books", title: "Books Editing", group: "publishing", level: 1, folderId: "1Xb241q-w6uxFJXEGYDrlf2Sn47UAAAiY" }),

  node({ id: "artist-talks", title: "Interviews", group: "interviews", level: 1, folderId: "1JoRd6-WoxqU9kAPmLnvEqUj2hgdhx9gR", featured: true }),
  node({
    id: "hidden-champions", title: "YouTube Podcast — Hidden Champions", group: "interviews", level: 1,
    folderId: "16Nu_ZC0oyKB3jV2x9UYrwp5iRQAKNYDA", source: "hidden-champions", featured: true
  }),
  node({
    id: "podcast-dao-le-na", title: "TS Đào Lê Na", group: "interviews", parentId: "hidden-champions", level: 2,
    folderId: "1W3ByCdKunPSmkznpdvfYyinV8ggd0PNT", coverId: "1-iu_hbrePPKeHVWJPEGlnfLp13y2pu_j",
    role: "Podcast Writer and Researcher", client: "Hidden Champions Show", period: "2024",
    summary: "An episode conversation with Dr Đào Lê Na, developed through research and a structured interview script.",
    outcome: "The public episode is paired with its photographic production record.",
    youtubeUrl: "https://www.youtube.com/watch?v=qfDlsVa0nvM&t=89s", tags: ["Podcast", "Research", "Interview"],
    directMedia: [
      media("1-iu_hbrePPKeHVWJPEGlnfLp13y2pu_j", "TS Đào Lê Na 01"),
      media("1UPVJrQakXcajVCEMs19NHqbdIj5TgqXa", "TS Đào Lê Na 02"),
      media("1mwlncxFPE_qmaMlxUXJ8dFeyiHwR50st", "TS Đào Lê Na 03")
    ]
  }),
  node({
    id: "podcast-phan-to-ny", title: "MC Phan Tô Ny", group: "interviews", parentId: "hidden-champions", level: 2,
    folderId: "1hg2lleKWV4Ze35vojqr65py_tsDQL6H9", coverId: "14qutztOWx3IYAhqPWxdHL_gy9WiYfUa1",
    role: "Podcast Writer and Researcher", client: "Hidden Champions Show", period: "2024",
    summary: "A research led episode with MC Phan Tô Ny, shaped around a natural conversational arc.",
    outcome: "The public video and four production images form a concise episode record.",
    youtubeUrl: "https://www.youtube.com/watch?v=1fneL_GGvGs", tags: ["Podcast", "Interview", "Script"],
    directMedia: [
      media("14qutztOWx3IYAhqPWxdHL_gy9WiYfUa1", "MC Phan Tô Ny 01", "image", "image/png"),
      media("1LXCbzKaTmSIHjvqTz4y9vkeo3dZCVUHH", "MC Phan Tô Ny 02", "image", "image/png"),
      media("1SsKIP5nSrYuLHXYDe5ZX3WntpqBhiCIS", "MC Phan Tô Ny 03", "image", "image/png"),
      media("1GkoAGEZXBmOxmH272pT3zAsaVwn_GLAX", "MC Phan Tô Ny 04", "image", "image/png")
    ]
  }),
  node({
    id: "podcast-khuat-nang-vinh", title: "CD Khuất Năng Vĩnh", group: "interviews", parentId: "hidden-champions", level: 2,
    folderId: "1Uk8219qSas854DvAHGl7VtcJidyarFKP", cover: "https://i.ytimg.com/vi/-WMCQMLuef0/hqdefault.jpg",
    role: "Podcast Writer and Researcher", client: "Hidden Champions Show", period: "2024",
    summary: "A creative leadership conversation with Creative Director Khuất Năng Vĩnh.",
    outcome: "The public episode is paired with the original Drive video record.",
    youtubeUrl: "https://www.youtube.com/watch?v=-WMCQMLuef0", tags: ["Podcast", "Creative direction", "Interview"],
    directMedia: [media("13JNSxRHJm9LKgMm6LzWrCBnqy7h36djq", "Khuất Năng Vĩnh — Drive video", "video", "video/mp4")]
  }),
  node({
    id: "podcast-dzung-yoko", title: "CD Dzũng Yoko", group: "interviews", parentId: "hidden-champions", level: 2,
    folderId: "1TZuvBDYtaZEiD77B0fQIiuG4OsRMqp_g", coverId: "1doe0rgf9yXiC-1CN8R_s6h9l-lj892c-",
    role: "Podcast Writer and Researcher", client: "Hidden Champions Show", period: "2024",
    summary: "A portrait led production collection from the conversation with Creative Director Dzũng Yoko.",
    outcome: "Six full resolution portraits are presented as a collapsible collection on the Talks landing and as a dedicated project gallery.",
    tags: ["Podcast", "Portrait", "Creative direction"],
    directMedia: [
      media("1doe0rgf9yXiC-1CN8R_s6h9l-lj892c-", "Dzũng Yoko 01"),
      media("1OqG0eZRkCNE3mJ9M-5ljY8jfN6g7WJKB", "Dzũng Yoko 02"),
      media("1qZjbRHwoIMyhIe0kuOvNJzcwTuDe80id", "Dzũng Yoko 03"),
      media("16lbVwJrpaLTghqZfSHySFb9IVZD2n87F", "Dzũng Yoko 04"),
      media("1OfUlpNSzp8bZxCuTKpsQEBgXei4So8CK", "Dzũng Yoko 05"),
      media("1qBmFj1kb0EODnh-XGqL4K-KOpyzj1nkd", "Dzũng Yoko 06")
    ]
  }),
  node({
    id: "podcast-nguyen-khang", title: "MC Nguyên Khang", group: "interviews", parentId: "hidden-champions", level: 2,
    folderId: "1drMb935rTATZJLcZXcQSkinCfnCZpHJ_", cover: "https://i.ytimg.com/vi/lZpcG-NGUBA/hqdefault.jpg",
    role: "Podcast Writer and Researcher", client: "Hidden Champions Show", period: "2024",
    summary: "A research led conversation with MC Nguyên Khang.",
    outcome: "The public YouTube episode and original Drive video are available from one project record.",
    youtubeUrl: "https://www.youtube.com/watch?v=lZpcG-NGUBA", tags: ["Podcast", "Interview", "Research"],
    directMedia: [media("1Zrz6vOTHz0DdJ7mq6MPFY-mVkFDmXvMh", "Nguyên Khang — Drive video", "video", "video/mp4")]
  }),
  node({
    id: "hidden-champions-scripts", title: "Hidden Champions Scripts", group: "interviews", parentId: "hidden-champions", level: 2,
    folderId: "1A61wp23uND0b2Y76e9KUZVG_o8Wwr2qU", cover: "media/covers/artist-talks-cover.jpg",
    role: "Podcast Writer and Editor", client: "Hidden Champions Show", period: "2024",
    summary: "Demo scripts and programme structures used to shape expert interviews into clear episode narratives.",
    outcome: "Script records make the research and narrative architecture behind the conversations visible.",
    tags: ["Podcast script", "Research", "Editorial"],
    directMedia: [
      media("1QPwviOmVCgbTVyN2AUCsHyoH1roQqYJ8", "TS Đào Lê Na — demo script", "link", "application/vnd.google-apps.shortcut"),
      media("1vWzZKUAH3jNHj9ZLyR6oAYAaZjU1iqg6", "Khuất Năng Vĩnh — demo script", "link", "application/vnd.google-apps.shortcut"),
      media("1Fz_wKIDbZNzkdsOhnakY_hwqcz0ScG2e", "Kịch bản A5", "pdf", "application/pdf")
    ]
  }),

  node({ id: "cuoc-dua-dau-thai", title: "Cuộc Đua Đầu Thai", group: "board-game", level: 1, folderId: "1CUaJgRthAoHyqlT0nr22lqHrc3CYHkCg", featured: true })
];

const output = {
  version: 3,
  generatedAt: "2026-07-23",
  groups,
  projects,
  profileDocuments: current.profileDocuments
};

fs.writeFileSync(new URL("../data/editorial.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${projects.length} project records across ${groups.length} groups.`);
