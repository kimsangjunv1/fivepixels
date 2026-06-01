import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { gzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";

const LIMIT_GZIP_BYTES = 15 * 1024;
const entries = [
    { name: "stitchable/report", file: "dist/components/report/index.js" },
    { name: "stitchable", file: "dist/index.js" },
];

function bundleMinGzip(entryFile) {
    const tempDir = mkdtempSync(join(tmpdir(), "stitchable-size-"));
    const outfile = join(tempDir, "bundle.js");
    const result = spawnSync(
        "npx",
        ["esbuild", entryFile, "--bundle", "--minify", "--format=esm", "--external:react", "--external:react-dom", `--outfile=${outfile}`],
        { encoding: "utf8" },
    );

    if (result.status !== 0) {
        rmSync(tempDir, { recursive: true, force: true });
        throw new Error(result.stderr || result.stdout || `esbuild failed for ${entryFile}`);
    }

    const source = readFileSync(outfile);
    const gzipBytes = gzipSync(source).length;
    rmSync(tempDir, { recursive: true, force: true });
    return { rawBytes: source.length, gzipBytes };
}

console.log("stitchable bundle size (minified, react/react-dom externalized):");
let failed = false;

for (const entry of entries) {
    const { rawBytes, gzipBytes } = bundleMinGzip(entry.file);
    const ok = entry.name === "stitchable/report" ? gzipBytes < LIMIT_GZIP_BYTES : true;
    const status = entry.name === "stitchable/report" ? (ok ? "OK" : "OVER") : "info";
    console.log(`  ${status.padEnd(4)} ${String(gzipBytes).padStart(5)} gzip / ${String(rawBytes).padStart(6)} raw  ${entry.name}`);
    if (entry.name === "stitchable/report" && !ok) {
        failed = true;
    }
}

console.log(`  limit ${LIMIT_GZIP_BYTES} gzip for stitchable/report`);

if (failed) {
    process.exitCode = 1;
}
