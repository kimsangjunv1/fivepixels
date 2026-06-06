import type { ReportFeedback } from "../types/report.js";
import { getFeedbackDisplayStatus } from "./feedbackThread.js";

export type RouteDetailStatus = "wait" | "suggested" | "git_issued" | "resolved";

export const ROUTE_DETAIL_STATUS_ORDER: RouteDetailStatus[] = ["wait", "suggested", "git_issued", "resolved"];

export const ROUTE_DETAIL_STATUS_LABEL: Record<RouteDetailStatus, string> = {
    wait: "Wait",
    suggested: "Suggested",
    git_issued: "Git Issued",
    resolved: "Resolved",
};

export function getRouteDetailStatus(report: ReportFeedback): RouteDetailStatus {
    if (report.status === "git_issued") {
        return "git_issued";
    }

    const displayStatus = getFeedbackDisplayStatus(report);

    if (displayStatus === "resolved") {
        return "resolved";
    }

    if (displayStatus === "suggested" || displayStatus === "found_error") {
        return "suggested";
    }

    return "wait";
}

export function isCreatedToday(createdAt: string, now = new Date()) {
    const created = new Date(createdAt);

    if (Number.isNaN(created.getTime())) {
        return false;
    }

    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth() && created.getDate() === now.getDate();
}
