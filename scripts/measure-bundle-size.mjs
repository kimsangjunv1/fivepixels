import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { gzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";

const TARGET_JS_GZIP_BYTES = 15 * 1024;
const TARGET_CSS_GZIP_BYTES = 12 * 1024;
const TARGET_TOTAL_GZIP_BYTES = TARGET_JS_GZIP_BYTES + TARGET_CSS_GZIP_BYTES;

const LIMIT_REPORT_TOTAL_GZIP_BYTES = 48 * 1024;
const LIMIT_CSS_GZIP_BYTES = 12 * 1024;

const entries = [
    { name: "@fivepixels-js/react/report", file: "dist/components/report/index.js" },
    { name: "@fivepixels-js/react", file: "dist/index.js" },
];

function gzipFileBytes(filePath) {
    const source = readFileSync(filePath);
    return {
        rawBytes: source.length,
        gzipBytes: gzipSync(source).length,
    };
}

function bundleMinGzip(entryFile) {
    const tempDir = mkdtempSync(join(tmpdir(), "fivepixels-size-"));
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

function formatRow(status, gzipBytes, rawBytes, label) {
    console.log(`  ${status.padEnd(4)} ${String(gzipBytes).padStart(5)} gzip / ${String(rawBytes).padStart(6)} raw  ${label}`);
}

console.log("fivepixels bundle size (minified, react/react-dom externalized):");
let failed = false;

let reportBundle = null;

for (const entry of entries) {
    const bundle = bundleMinGzip(entry.file);
    const isReportEntry = entry.name === "@fivepixels-js/react/report";
    const status = isReportEntry ? (bundle.gzipBytes <= LIMIT_REPORT_TOTAL_GZIP_BYTES ? "OK" : "OVER") : "info";
    formatRow(status, bundle.gzipBytes, bundle.rawBytes, entry.name);

    if (isReportEntry) {
        reportBundle = bundle;

        if (bundle.gzipBytes > LIMIT_REPORT_TOTAL_GZIP_BYTES) {
            failed = true;
        }
    }
}

const css = gzipFileBytes("dist/styles/reportStylesheet.js");
const cssStatus = css.gzipBytes <= LIMIT_CSS_GZIP_BYTES ? "OK" : "OVER";
formatRow(cssStatus, css.gzipBytes, css.rawBytes, "stylesheet (reportStylesheet.js)");

if (css.gzipBytes > LIMIT_CSS_GZIP_BYTES) {
    failed = true;
}

if (reportBundle) {
    const estimatedJsGzip = Math.max(0, reportBundle.gzipBytes - css.gzipBytes);
    const jsTargetStatus = estimatedJsGzip <= TARGET_JS_GZIP_BYTES ? "OK" : "goal";
    formatRow(jsTargetStatus, estimatedJsGzip, reportBundle.rawBytes - css.rawBytes, "@fivepixels-js/react/report JS (total - stylesheet)");
}

console.log("");
console.log(`  CI limits: report total <= ${LIMIT_REPORT_TOTAL_GZIP_BYTES} gzip, css <= ${LIMIT_CSS_GZIP_BYTES} gzip`);
console.log(`  stretch goals: js <= ${TARGET_JS_GZIP_BYTES} gzip, css <= ${TARGET_CSS_GZIP_BYTES} gzip, total <= ${TARGET_TOTAL_GZIP_BYTES} gzip`);

if (failed) {
    process.exitCode = 1;
}
