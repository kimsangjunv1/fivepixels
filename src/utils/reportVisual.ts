import type { ReportFeedback, ReportStatus } from "../types/report.js";
import { TARGET_COLOR } from "../constants/report.js";

export function hasReply(report: ReportFeedback) {
    return report.replies.length > 0;
}

export function getReplyStatusTone(hasCompletedReply: boolean) {
    return hasCompletedReply
        ? { backgroundColor: "#e8f5e9", color: "#2e7d32" }
        : { backgroundColor: "#ffebee", color: "#c62828" };
}

export function getMarkerColor(report: ReportFeedback) {
    return hasReply(report) ? "#22c55e" : TARGET_COLOR[report.report_type];
}

export function getStatusTone(status: ReportStatus) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }

    if (status === "archived") {
        return { backgroundColor: "#f3f4f6", color: "#4b5563" };
    }

    return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
}
