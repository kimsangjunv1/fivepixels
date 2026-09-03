import { ACCENT_COLOR } from "@/shared/constants/accentColors.js";
import type { MarkerColorPreferences } from "@/shared/constants/markerAppearance.js";
import { DEFAULT_MARKER_COLORS } from "@/shared/constants/markerAppearance.js";
import type { ReportFeedback, ReportStatus } from "@/shared/types/report.js";
import { getReplyCount } from "@/shared/utils/feedback/feedbackThread.js";
import { getIssueProgressLabel, getReportCases } from "@/shared/utils/report/reportCases.js";

export function hasReply(report: ReportFeedback) {
    return getReplyCount(report) > 0;
}

export function getReplyStatusTone(hasCompletedReply: boolean) {
    return hasCompletedReply
        ? { backgroundColor: "#e8f5e9", color: "#2e7d32" }
        : { backgroundColor: "#ffebee", color: "#c62828" };
}

export function getMarkerColor(report: ReportFeedback, colors: MarkerColorPreferences = DEFAULT_MARKER_COLORS) {
    if (report.status === "resolved") {
        return colors.resolved;
    }

    if (report.status === "git_issued") {
        return colors.gitIssued;
    }

    if (report.category === "memo") {
        return ACCENT_COLOR.pink;
    }

    return colors.open;
}

export function getMarkerDisplayLabel(report: ReportFeedback): string | null {
    if (getReportCases(report).length > 1) {
        return getIssueProgressLabel(report);
    }

    return null;
}

export function hasMarkerReplyIndicator(report: ReportFeedback, replyCount = getReplyCount(report)) {
    return replyCount > 0;
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
