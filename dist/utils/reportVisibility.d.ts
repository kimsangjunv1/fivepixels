import type { ReportVisibility } from "../types/report.js";
export type ResolvedReportVisibility = {
    enabled: boolean;
    devOnly: boolean;
    routeKey?: string;
};
export type ResolveReportVisibilityOptions = {
    visibility?: ReportVisibility;
    /** @deprecated Use `visibility.enabled`. */
    enabled?: boolean;
    /** @deprecated Use `visibility.devOnly`. */
    devOnly?: boolean;
    /** @deprecated Use `visibility.routeKey`. */
    routeKey?: string;
    /** @deprecated Use `visibility.routeKey`. */
    pathname?: string;
};
export declare function resolveReportVisibility({ visibility, enabled, devOnly, routeKey, pathname, }: ResolveReportVisibilityOptions): ResolvedReportVisibility;
//# sourceMappingURL=reportVisibility.d.ts.map