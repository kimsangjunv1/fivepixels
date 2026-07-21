import { resolveProjectId } from "./projectId.js";
export function resolveReportProject({ project }) {
    return {
        projectId: resolveProjectId(project?.id),
        environment: project?.env,
        appVersion: project?.version,
    };
}
//# sourceMappingURL=reportProject.js.map