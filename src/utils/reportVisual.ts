import type { ReportFeedback, ReportStatus } from "@/types/report.js";
import { getReplyCount } from "@/utils/feedbackThread.js";
import { getIssueProgressLabel, getReportCases } from "@/utils/reportCases.js";
import { TARGET_COLOR } from "@/constants/report.js";

export function hasReply(report: ReportFeedback) {
    return getReplyCount(report) > 0;
}

export function getReplyStatusTone(hasCompletedReply: boolean) {
    return hasCompletedReply
        ? { backgroundColor: "#e8f5e9", color: "#2e7d32" }
        : { backgroundColor: "#ffebee", color: "#c62828" };
}

export function getMarkerColor(report: ReportFeedback) {
    if (report.status === "resolved") {
        return "var(--adaptive-green500)";
    }

    if (report.status === "git_issued") {
        return "var(--adaptive-blue500)";
    }

    return TARGET_COLOR.item;
}

export function getMarkerDisplayLabel(report: ReportFeedback, replyCount = getReplyCount(report)): string | null {
    if (getReportCases(report).length > 1) {
        return getIssueProgressLabel(report);
    }

    if (replyCount > 0) {
        return `+${replyCount}`;
    }

    return null;
}

export function getStatusTone(status: ReportStatus) {
    if (status === "resolved") {
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
    }

    if (status === "git_issued") {
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
    }

    if (status === "archived") {
        return { backgroundColor: "#f3f4f6", color: "#4b5563" };
    }

    return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
}
