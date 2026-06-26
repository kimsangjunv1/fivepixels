import type { ReportVisibility } from "@/types/report.js";
export type ResolvedReportVisibility = {
    enabled: boolean;
    devOnly: boolean;
    routeKey?: string;
};
export type ResolveReportVisibilityOptions = {
    visibility?: ReportVisibility;
};
export declare function resolveReportVisibility({ visibility }: ResolveReportVisibilityOptions): ResolvedReportVisibility;
//# sourceMappingURL=reportVisibility.d.ts.map