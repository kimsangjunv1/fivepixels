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
};

export function resolveReportVisibility({ visibility }: ResolveReportVisibilityOptions): ResolvedReportVisibility {
    return {
        enabled: visibility?.enabled ?? DEFAULT_VISIBILITY.enabled,
        devOnly: visibility?.devOnly ?? DEFAULT_VISIBILITY.devOnly,
        routeKey: visibility?.routeKey,
    };
}
