import { resolveProjectId } from "./projectId.js";
export function resolveReportProject({ project, projectId, environment, appVersion, }) {
    return {
        projectId: resolveProjectId(project?.id ?? projectId),
        environment: project?.env ?? environment,
        appVersion: project?.version ?? appVersion,
    };
}
//# sourceMappingURL=reportProject.js.map