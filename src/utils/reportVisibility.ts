import type { ReportVisibility } from "@/types/report.js";

export type ResolvedReportVisibility = {
    enabled: boolean;
    devOnly: boolean;
    routeKey?: string;
};

const DEFAULT_VISIBILITY: Pick<ResolvedReportVisibility, "enabled" | "devOnly"> = {
    enabled: true,
    devOnly: false,
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

export function resolveReportVisibility({
    visibility,
    enabled,
    devOnly,
    routeKey,
    pathname,
}: ResolveReportVisibilityOptions): ResolvedReportVisibility {
    return {
        enabled: visibility?.enabled ?? enabled ?? DEFAULT_VISIBILITY.enabled,
        devOnly: visibility?.devOnly ?? devOnly ?? DEFAULT_VISIBILITY.devOnly,
        routeKey: visibility?.routeKey ?? routeKey ?? pathname,
    };
}
