#!/usr/bin/env node
/**
 * Fails if src/* (except utils domain files) or examples import flat `@/utils/X.js`
 * (single segment). Prefer `@/utils/<domain>/X.js`.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCOPES = ["src/components", "src/hooks", "src/providers", "src/storage", "src/constants", "src/types", "src/i18n", "examples"];
const FLAT_IMPORT = /from\s+["']@\/utils\/([^/"']+)\.js["']/g;

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === "dist") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(tsx?|jsx?|mts|cts)$/.test(entry.name)) out.push(full);
    }
    return out;
}

const violations = [];

for (const scope of SCOPES) {
    for (const file of walk(path.join(ROOT, scope))) {
        const text = fs.readFileSync(file, "utf8");
        for (const match of text.matchAll(FLAT_IMPORT)) {
            const segment = match[1];
            if (!segment.includes("/")) {
                violations.push({
                    file: path.relative(ROOT, file),
                    import: `@/utils/${segment}.js`,
                });
            }
        }
    }
}

if (violations.length > 0) {
    console.error("Flat @/utils/<name>.js imports are banned. Use domain paths (@/utils/<domain>/<name>.js):\n");
    for (const v of violations) {
        console.error(`  ${v.file}: ${v.import}`);
    }
    console.error(`\n${violations.length} violation(s).`);
    process.exit(1);
}

console.log("check-no-flat-utils: ok");
