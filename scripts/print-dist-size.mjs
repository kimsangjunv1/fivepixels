import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const distRoot = new URL("../dist", import.meta.url).pathname;

async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await walk(fullPath)));
            continue;
        }

        if (!entry.name.endsWith(".js")) {
            continue;
        }

        const { size } = await stat(fullPath);
        files.push({
            path: path.relative(distRoot, fullPath),
            size,
        });
    }

    return files;
}

const files = await walk(distRoot);
files.sort((a, b) => b.size - a.size);

let total = 0;

console.log("fivepixels dist/*.js sizes (bytes, unminified):");
for (const file of files) {
    total += file.size;
    console.log(`  ${String(file.size).padStart(6)}  ${file.path}`);
}

console.log(`  ${"─".repeat(6)}`);
console.log(`  ${String(total).padStart(6)}  total`);
