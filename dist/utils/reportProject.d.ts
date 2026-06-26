import type { ReportProject } from "@/types/report.js";
export type ResolvedReportProject = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};
export type ResolveReportProjectOptions = {
    project?: ReportProject;
};
export declare function resolveReportProject({ project }: ResolveReportProjectOptions): ResolvedReportProject;
//# sourceMappingURL=reportProject.d.ts.map