import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

rmSync(distDir, { recursive: true, force: true });
