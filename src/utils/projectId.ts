import { DEFAULT_PROJECT_ID } from "@/constants/project.js";
import { isProductionEnv } from "./env.js";

let hasWarnedDefaultProjectId = false;

export function resolveProjectId(projectId?: string | null): string {
    if (projectId) {
        return projectId;
    }

    if (!isProductionEnv() && !hasWarnedDefaultProjectId) {
        hasWarnedDefaultProjectId = true;
        console.warn(
            `[stitchable] project.id defaults to "${DEFAULT_PROJECT_ID}". Set project={{ id }} for production or multi-project storage.`,
        );
    }

    return DEFAULT_PROJECT_ID;
}
