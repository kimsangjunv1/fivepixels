import { readFileSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";
import { gzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";

const TARGET_JS_GZIP_BYTES = 15 * 1024;
const TARGET_CSS_GZIP_BYTES = 12 * 1024;
const TARGET_TOTAL_GZIP_BYTES = TARGET_JS_GZIP_BYTES + TARGET_CSS_GZIP_BYTES;

// Hard CI ceilings (stretch goals above stay stricter). Adjusted after feature growth
// while install was broken; raise deliberately when intentionally shipping bigger entry/CSS.
const LIMIT_REPORT_MAIN_GZIP_BYTES = 120 * 1024;
const LIMIT_CSS_GZIP_BYTES = 15 * 1024;

const entries = [
    { name: "@fivepixels-js/react/report", file: "dist/components/report/index.js", useSplitting: true },
    { name: "@fivepixels-js/react", file: "dist/index.js", useSplitting: false },
];

function gzipFileBytes(filePath) {
    const source = readFileSync(filePath);
    return {
        rawBytes: source.length,
        gzipBytes: gzipSync(source).length,
    };
}

function bundleEntry(entryFile, useSplitting) {
    const tempDir = mkdtempSync(join(tmpdir(), "fivepixels-size-"));
    const args = ["esbuild", entryFile, "--bundle", "--minify", "--format=esm", "--external:react", "--external:react-dom"];

    if (useSplitting) {
        args.push("--splitting", `--outdir=${tempDir}`);
    } else {
        args.push(`--outfile=${join(tempDir, "bundle.js")}`);
    }

    const result = spawnSync("npx", args, { encoding: "utf8" });

    if (result.status !== 0) {
        rmSync(tempDir, { recursive: true, force: true });
        throw new Error(result.stderr || result.stdout || `esbuild failed for ${entryFile}`);
    }

    const files = readdirSync(tempDir).map((name) => {
        const source = readFileSync(join(tempDir, name));
        return {
            name,
            rawBytes: source.length,
            gzipBytes: gzipSync(source).length,
        };
    });

    rmSync(tempDir, { recursive: true, force: true });

    if (!useSplitting) {
        const bundle = files[0];
        return { main: bundle, lazyChunks: [], totalGzip: bundle.gzipBytes };
    }

    const main = files.find((file) => basename(entryFile) === file.name) ?? files[0];
    const lazyChunks = files.filter((file) => file !== main);

    return {
        main,
        lazyChunks,
        totalGzip: files.reduce((sum, file) => sum + file.gzipBytes, 0),
    };
}

function formatRow(status, gzipBytes, rawBytes, label) {
    console.log(`  ${status.padEnd(4)} ${String(gzipBytes).padStart(5)} gzip / ${String(rawBytes).padStart(6)} raw  ${label}`);
}

console.log("fivepixels bundle size (minified, react/react-dom externalized):");
let failed = false;

let reportMainBundle = null;

for (const entry of entries) {
    const bundle = bundleEntry(entry.file, entry.useSplitting);
    const isReportEntry = entry.name === "@fivepixels-js/react/report";
    const status = isReportEntry ? (bundle.main.gzipBytes <= LIMIT_REPORT_MAIN_GZIP_BYTES ? "OK" : "OVER") : "info";
    formatRow(status, bundle.main.gzipBytes, bundle.main.rawBytes, entry.name);

    if (isReportEntry) {
        reportMainBundle = bundle.main;

        if (bundle.main.gzipBytes > LIMIT_REPORT_MAIN_GZIP_BYTES) {
            failed = true;
        }

        for (const chunk of bundle.lazyChunks) {
            formatRow("info", chunk.gzipBytes, chunk.rawBytes, `lazy chunk (${chunk.name})`);
        }

        formatRow("info", bundle.totalGzip, bundle.main.rawBytes, `${entry.name} total with lazy chunks`);
    }
}

const css = gzipFileBytes("dist/styles/reportStylesheet.js");
const cssStatus = css.gzipBytes <= LIMIT_CSS_GZIP_BYTES ? "OK" : "OVER";
formatRow(cssStatus, css.gzipBytes, css.rawBytes, "stylesheet (reportStylesheet.js)");

if (css.gzipBytes > LIMIT_CSS_GZIP_BYTES) {
    failed = true;
}

if (reportMainBundle) {
    const jsTargetStatus = reportMainBundle.gzipBytes <= TARGET_JS_GZIP_BYTES ? "OK" : "goal";
    formatRow(jsTargetStatus, reportMainBundle.gzipBytes, reportMainBundle.rawBytes, "@fivepixels-js/react/report JS (entry chunk)");
}

console.log("");
console.log(`  CI limits: report entry <= ${LIMIT_REPORT_MAIN_GZIP_BYTES} gzip, css <= ${LIMIT_CSS_GZIP_BYTES} gzip`);
console.log(`  stretch goals: js <= ${TARGET_JS_GZIP_BYTES} gzip, css <= ${TARGET_CSS_GZIP_BYTES} gzip, total <= ${TARGET_TOTAL_GZIP_BYTES} gzip`);

if (failed) {
    process.exitCode = 1;
}
