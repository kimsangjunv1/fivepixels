import { getFeedbackDisplayStatus } from "../../utils/feedback/feedbackThread.js";
import { getReportCases } from "../../utils/report/reportCases.js";
import { isCreatedToday } from "../../utils/panel/routeDetailStatus.js";
const NEEDS_REPLY_STATUSES = new Set(["wait_for_reply", "additional_question"]);
const ATTENTION_STATUSES = new Set(["found_error", "recheck_requested", "wait_for_reply", "additional_question"]);
const IN_PROGRESS_STATUSES = new Set(["wait_for_reply", "additional_question", "suggested", "found_error", "recheck_requested"]);
/** Prefer all-page reports when list scope is "all" or an all-page list is already loaded. */
export function resolveExperimentalListSource(reports, allPageReports, listScope) {
    if (listScope === "all" || allPageReports.length > 0) {
        return allPageReports.length > 0 ? allPageReports : reports;
    }
    return reports;
}
function isAssignedTo(report, actorName) {
    if (!actorName) {
        return false;
    }
    return getReportCases(report).some((item) => item.assignee_name?.trim() === actorName);
}
function statusOf(report) {
    return getFeedbackDisplayStatus(report, true);
}
export function getCaseCount(report) {
    return getReportCases(report).length;
}
export function filterMyTasks(reports, actorName) {
    return reports.filter((report) => {
        const status = statusOf(report);
        if (status === "resolved") {
            return false;
        }
        return isAssignedTo(report, actorName) || NEEDS_REPLY_STATUSES.has(status) || status === "recheck_requested";
    });
}
export function filterNeedsAttention(reports) {
    return reports.filter((report) => ATTENTION_STATUSES.has(statusOf(report)));
}
export function filterTodayDigest(reports, now = new Date()) {
    return reports.filter((report) => {
        if (isCreatedToday(report.created_at, now)) {
            return true;
        }
        const latestActivity = report.latest_reply?.created_at ?? report.created_at;
        if (statusOf(report) === "resolved" && isCreatedToday(latestActivity, now)) {
            return true;
        }
        return false;
    });
}
export function buildPageBriefSummary(reports) {
    const statusCounts = new Map();
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    for (const report of reports) {
        const status = statusOf(report);
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
        if (status === "resolved") {
            resolved += 1;
        }
        else {
            open += 1;
        }
        if (IN_PROGRESS_STATUSES.has(status)) {
            inProgress += 1;
        }
    }
    const topStatuses = [...statusCounts.entries()]
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    return {
        total: reports.length,
        open,
        inProgress,
        resolved,
        topStatuses,
    };
}
export function buildProjectHealthSummary(reports, now = new Date()) {
    let open = 0;
    let resolved = 0;
    let todayNew = 0;
    let gitIssued = 0;
    let errors = 0;
    let recheck = 0;
    for (const report of reports) {
        const status = statusOf(report);
        if (status === "resolved") {
            resolved += 1;
        }
        else {
            open += 1;
        }
        if (isCreatedToday(report.created_at, now)) {
            todayNew += 1;
        }
        if (status === "git_issued") {
            gitIssued += 1;
        }
        if (status === "found_error") {
            errors += 1;
        }
        if (status === "recheck_requested") {
            recheck += 1;
        }
    }
    const total = reports.length;
    return {
        total,
        open,
        resolved,
        completionRate: total > 0 ? Math.round((resolved / total) * 100) : null,
        todayNew,
        gitIssued,
        errors,
        recheck,
    };
}
//# sourceMappingURL=experimentalPanelTabs.js.map