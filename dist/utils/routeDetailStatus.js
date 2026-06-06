import { getFeedbackDisplayStatus } from "./feedbackThread.js";
export const ROUTE_DETAIL_STATUS_ORDER = ["wait", "suggested", "resolved"];
export const ROUTE_DETAIL_STATUS_LABEL = {
    wait: "Wait",
    suggested: "Suggested",
    resolved: "Resolved",
};
export function getRouteDetailStatus(report) {
    const displayStatus = getFeedbackDisplayStatus(report);
    if (displayStatus === "resolved") {
        return "resolved";
    }
    if (displayStatus === "suggested" || displayStatus === "found_error") {
        return "suggested";
    }
    return "wait";
}
export function isCreatedToday(createdAt, now = new Date()) {
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) {
        return false;
    }
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth() && created.getDate() === now.getDate();
}
//# sourceMappingURL=routeDetailStatus.js.map