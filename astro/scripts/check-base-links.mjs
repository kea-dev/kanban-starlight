// Fails when a built HTML file has an internal href/src starting with "/" but not with the base.
// The base is taken from BASE_PATH (as used by CI) or else from astro.config.mjs.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../astro.config.mjs";

const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const base = (process.env.BASE_PATH ?? config.base ?? "").replace(/\/+$/, "");

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

const attr = /\s(?:href|src)=["'](\/[^"']*)["']/g;
const problems = [];
for (const file of htmlFiles(distDir)) {
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(attr)) {
    if (url.startsWith("//")) continue;
    if (!base) continue;
    if (url === base || url.startsWith(`${base}/`)) continue;
    problems.push(`${file}: ${url}`);
  }
}

if (problems.length) {
  console.error(
    `Internal links missing base "${base}":\n${problems.join("\n")}`,
  );
  process.exit(1);
}
console.log(`All internal links include base "${base}".`);
