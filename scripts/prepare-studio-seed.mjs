import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export function seedIdentity(key) {
  const hex = createHash("sha256").update(`portfolio-studio:${key}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
export function extractSeed(source, filename, sectionId, kind, title) {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let section;
  function attribute(element, name) {
    const value = element.attributes.properties.find((property) => ts.isJsxAttribute(property) && property.name.getText(ast) === name)?.initializer;
    return value && ts.isStringLiteral(value) ? value.text : null;
  }
  function find(node) {
    if (ts.isJsxElement(node) && attribute(node.openingElement, "id") === sectionId) section = node;
    ts.forEachChild(node, find);
  }
  find(ast);
  if (!section) throw new Error(`Missing source section ${filename}#${sectionId}`);
  const text = [];
  const media = new Set();
  const unresolvedExpressions = [];
  function collect(node) {
    if (ts.isJsxText(node)) {
      const value = node.text.replace(/\s+/g, " ").trim();
      if (value) text.push(value);
      return;
    }
    if (ts.isJsxExpression(node)) {
      if (node.expression && ts.isStringLiteral(node.expression)) text.push(node.expression.text);
      else if (node.expression) unresolvedExpressions.push(node.getText(ast));
      return;
    }
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === "Image") {
      const src = attribute(node, "src");
      if (src?.startsWith("/")) media.add(`asset:${src.slice(1)}`);
    }
    if (ts.isJsxElement(node)) for (const child of node.children) collect(child);
  }
  collect(section);
  const fragment = section.getText(ast);
  const seedKey = `${filename}#${sectionId}`;
  return {
    seedKey, checksum: createHash("sha256").update(fragment).digest("hex"), sourceFragment: fragment,
    requiresEditorialReview: true, unresolvedExpressions,
    entry: { id: seedIdentity(seedKey), kind, title, slug: `legacy-${sectionId}`, summary: "", body: text.join("\n\n"), details: {}, media: [...media], workflow: "draft" },
  };
}

export async function prepareSeedPlan(root = process.cwd()) {
  const specifications = [
    ["app/research/page.tsx", "dorsey", "research", "Dorsey research project"],
    ["app/research/page.tsx", "douglas", "research", "Douglas research project"],
    ["app/research/page.tsx", "yang", "research", "Yang research project"],
    ["app/page.tsx", "experience", "experience", "Professional experience"],
    ["app/page.tsx", "gallery", "gallery", "Portfolio gallery"],
  ];
  const entries = [];
  for (const [filename, section, kind, title] of specifications) entries.push(extractSeed(await readFile(path.join(root, filename), "utf8"), filename, section, kind, title));
  const localDrafts = [];
  const directory = path.join(root, ".studio", "drafts");
  let files = [];
  try { files = await readdir(directory); } catch (error) { if (error.code !== "ENOENT") throw error; }
  for (const filename of files.filter((name) => /^[0-9a-f-]{36}\.json$/i.test(name))) {
    const raw = await readFile(path.join(directory, filename), "utf8");
    localDrafts.push({ filename, checksum: createHash("sha256").update(raw).digest("hex"), entry: JSON.parse(raw) });
  }
  return { version: 1, purpose: "private-import-review", publication: "none", entries, localDrafts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const plan = await prepareSeedPlan();
  if (process.argv.includes("--write")) {
    await mkdir(".studio", { recursive: true });
    await writeFile(".studio/seed-review.json", JSON.stringify(plan, null, 2), { mode: 0o600 });
  }
  console.log(JSON.stringify({ sourceSections: plan.entries.length, localDrafts: plan.localDrafts.length, reviewFileWritten: process.argv.includes("--write"), databaseWrites: 0 }));
}
