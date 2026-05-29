import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    root: new URL("./", import.meta.url).pathname,
    resolve: {
        alias: {
            stitchable: new URL("../../src/index.ts", import.meta.url).pathname,
        },
    },
});
