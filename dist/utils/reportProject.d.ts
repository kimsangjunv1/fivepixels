import type { ReportProject } from "../types/report.js";
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
export declare function resolveReportProject({ project, projectId, environment, appVersion, }: ResolveReportProjectOptions): ResolvedReportProject;
//# sourceMappingURL=reportProject.d.ts.map