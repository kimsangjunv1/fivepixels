import type { ReportProject } from "@/types/report.js";
import { resolveProjectId } from "./projectId.js";

export type ResolvedReportProject = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};

export type ResolveReportProjectOptions = {
    project?: ReportProject;
    /** @deprecated Use `project.id`. */
    projectId?: string;
    /** @deprecated Use `project.env`. */
    environment?: string;
    /** @deprecated Use `project.version`. */
    appVersion?: string;
};

export function resolveReportProject({
    project,
    projectId,
    environment,
    appVersion,
}: ResolveReportProjectOptions): ResolvedReportProject {
    return {
        projectId: resolveProjectId(project?.id ?? projectId),
        environment: project?.env ?? environment,
        appVersion: project?.version ?? appVersion,
    };
}
