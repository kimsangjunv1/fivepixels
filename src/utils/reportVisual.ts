import { TARGET_COLOR } from "../constants/report.js";
import type { ReportFeedback, ReportStatus } from "../types/report.js";

export function hasReply(report: ReportFeedback) {
    return report.replies.length > 0;
}

export function getReplyStatusTone(hasCompletedReply: boolean) {
    return hasCompletedReply
        ? { backgroundColor: "var(--adaptive-green50)", color: "var(--adaptive-green700)" }
        : { backgroundColor: "var(--adaptive-red50)", color: "var(--adaptive-red700)" };
}

export function getMarkerColor(report: ReportFeedback) {
    return hasReply(report) ? "var(--adaptive-green500)" : TARGET_COLOR[report.report_type];
}

export function getStatusTone(status: ReportStatus) {
    if (status === "resolved") {
        return { backgroundColor: "var(--adaptive-green50)", color: "var(--adaptive-green700)" };
    }

    if (status === "archived") {
        return { backgroundColor: "var(--adaptive-grey100)", color: "var(--adaptive-grey700)" };
    }

    return { backgroundColor: "var(--adaptive-blue50)", color: "var(--adaptive-blue700)" };
}
