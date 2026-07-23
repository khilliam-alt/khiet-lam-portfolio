import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const data = JSON.parse(fs.readFileSync(path.join(root, "data/editorial.json"), "utf8"));
const errors = [];
const ids = new Set();
const groups = new Set(data.groups.map(group => group.id));

for (const project of data.projects) {
  if (ids.has(project.id)) errors.push(`Duplicate project id: ${project.id}`);
  ids.add(project.id);
  if (!groups.has(project.group)) errors.push(`Unknown group on ${project.id}: ${project.group}`);
  if (!project.cover) errors.push(`Missing cover on ${project.id}`);
  if (!project.folderUrl) errors.push(`Missing folder URL on ${project.id}`);
  if (!Array.isArray(project.media)) errors.push(`Missing media array on ${project.id}`);
}

for (const project of data.projects) {
  if (project.parentId && !ids.has(project.parentId)) errors.push(`Unknown parent on ${project.id}: ${project.parentId}`);
  if (project.parentId) {
    const parent = data.projects.find(item => item.id === project.parentId);
    if (parent && project.level !== parent.level + 1) errors.push(`Incorrect level on ${project.id}`);
  }
}

for (const group of data.groups) {
  if (!ids.has(group.leadProject)) errors.push(`Unknown lead project on ${group.id}`);
  for (const item of group.showcase || []) {
    if (item.projectId && !ids.has(item.projectId)) errors.push(`Unknown showcase project on ${group.id}: ${item.projectId}`);
  }
}

for (const htmlFile of ["index.html", "group.html", "project.html"]) {
  const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"]*)?"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:)/.test(target)) continue;
    if (!fs.existsSync(path.join(root, target))) errors.push(`${htmlFile} references missing file: ${target}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${data.projects.length} projects, ${data.groups.length} groups and all local page assets.`);
