export const DASHBOARD_PATHS = ["/", "/issues", "/reviews", "/release", "/settings"] as const;

export type DashboardPath = (typeof DASHBOARD_PATHS)[number];

export function isDashboardPath(pathname: string): pathname is DashboardPath {
    return (DASHBOARD_PATHS as readonly string[]).includes(pathname);
}
