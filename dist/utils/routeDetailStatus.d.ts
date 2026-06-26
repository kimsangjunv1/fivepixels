import type { ReportFeedback } from "@/types/report.js";
export type RouteDetailStatus = "wait" | "suggested" | "git_issued" | "resolved";
export declare const ROUTE_DETAIL_STATUS_ORDER: RouteDetailStatus[];
export declare const ROUTE_DETAIL_STATUS_LABEL: Record<RouteDetailStatus, string>;
export declare function getRouteDetailStatus(report: ReportFeedback): RouteDetailStatus;
export declare function isCreatedToday(createdAt: string, now?: Date): boolean;
//# sourceMappingURL=routeDetailStatus.d.ts.map