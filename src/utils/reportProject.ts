import type { ReportProject } from "@/types/report.js";
import { resolveProjectId } from "./projectId.js";

export type ResolvedReportProject = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};

export type ResolveReportProjectOptions = {
    project?: ReportProject;
};

export function resolveReportProject({ project }: ResolveReportProjectOptions): ResolvedReportProject {
    return {
        projectId: resolveProjectId(project?.id),
        environment: project?.env,
        appVersion: project?.version,
    };
}
