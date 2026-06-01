import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const reportStylesheetDev = new URL("../../src/styles/reportStylesheet.dev.ts", import.meta.url).pathname;

function stitchableDevReportStylesheet(): Plugin {
    return {
        name: "stitchable-dev-report-stylesheet",
        enforce: "pre",
        resolveId(source, importer) {
            if (!source.endsWith("styles/reportStylesheet.js") || !importer?.includes("ShadowReportRoot")) {
                return null;
            }

            return reportStylesheetDev;
        },
    };
}

export default defineConfig({
    plugins: [react(), stitchableDevReportStylesheet()],
    css: {
        postcss: new URL("../../postcss.config.js", import.meta.url).pathname,
    },
    root: new URL("./", import.meta.url).pathname,
    build: {
        outDir: "dist",
        reportCompressedSize: true,
    },
    resolve: {
        alias: {
            stitchable: new URL("../../src/index.ts", import.meta.url).pathname,
        },
    },
});
