import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const maximumLines = 100;
const root = fileURLToPath(new URL("..", import.meta.url));
const checkedExtensions = new Set([
  ".cjs", ".css", ".html", ".js", ".json", ".jsx", ".md", ".mjs",
  ".scss", ".ts", ".tsx", ".yaml", ".yml",
]);
const checkedFileNames = new Set(["LICENSE", "Makefile"]);
const ignoredDirectories = new Set([".git", ".vite", "coverage", "dist", "node_modules"]);
const ignoredFiles = new Set(["package-lock.json"]);

async function collect(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) return collect(path);
    if (entry.isFile() && !ignoredFiles.has(entry.name)) return Promise.resolve([path]);
    return Promise.resolve([]);
  }));
  return nested.flat();
}

function isChecked(file: string): boolean {
  return checkedExtensions.has(extname(file)) || checkedFileNames.has(basename(file));
}

function countLines(content: string): number {
  if (content === "") return 0;
  return content.split(/\r?\n/u).length - Number(content.endsWith("\n"));
}

const files = (await collect(root)).filter((file) => isChecked(file));
const results = await Promise.all(files.map(async (file) => {
  const lines = countLines(await readFile(file, "utf8"));
  return lines > maximumLines ? `${relative(root, file)}: ${lines} lines` : undefined;
}));
const violations = results.filter((result): result is string => result !== undefined);
if (violations.length > 0) {
  throw new Error(`Files exceed ${maximumLines} lines:\n${violations.join("\n")}`);
}