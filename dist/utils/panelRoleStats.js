import { getFeedbackDisplayStatus } from "../utils/feedbackThread.js";
import { getReportCases } from "../utils/reportCases.js";
import { formatStatCount } from "../utils/formatStatCount.js";
import { isCreatedToday } from "../utils/routeDetailStatus.js";
const IN_PROGRESS_STATUSES = new Set(["wait_for_reply", "additional_question", "suggested", "found_error", "recheck_requested"]);
function isAssignedTo(report, actorName) {
    if (!actorName) {
        return false;
    }
    return getReportCases(report).some((item) => item.assignee_name?.trim() === actorName);
}
function countBy(reports, predicate) {
    let count = 0;
    for (const report of reports) {
        if (predicate(report)) {
            count += 1;
        }
    }
    return count;
}
function statItem(key, label, value) {
    return { key, kind: "stat", label, display: formatStatCount(value) };
}
export function buildPanelRoleStats({ role, reports, actorName, fallbackStats, messages }) {
    const panel = messages.panel;
    const stats = panel.roleStats;
    const statusOf = (report) => getFeedbackDisplayStatus(report, true);
    const resolvedCount = () => countBy(reports, (report) => statusOf(report) === "resolved");
    switch (role) {
        case "qa":
            return [
                statItem("open", stats.open, countBy(reports, (report) => statusOf(report) !== "resolved")),
                statItem("errors", stats.errors, countBy(reports, (report) => statusOf(report) === "found_error")),
                statItem("recheck", stats.recheck, countBy(reports, (report) => statusOf(report) === "recheck_requested")),
            ];
        case "developer":
            return [
                statItem("mine", stats.mine, countBy(reports, (report) => statusOf(report) !== "resolved" && isAssignedTo(report, actorName))),
                statItem("needsReply", stats.needsReply, countBy(reports, (report) => {
                    const status = statusOf(report);
                    return status === "wait_for_reply" || status === "additional_question";
                })),
                statItem("reReview", stats.reReview, countBy(reports, (report) => statusOf(report) === "recheck_requested")),
            ];
        case "designer":
            return [
                statItem("total", stats.total, reports.length),
                statItem("review", stats.review, countBy(reports, (report) => IN_PROGRESS_STATUSES.has(statusOf(report)))),
                statItem("reflected", stats.reflected, resolvedCount()),
            ];
        case "planner": {
            const total = reports.length;
            const resolved = resolvedCount();
            const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
            return [
                { key: "completionRate", kind: "stat", label: stats.completionRate, display: total > 0 ? `${completionRate}%` : "-" },
                statItem("today", stats.today, countBy(reports, (report) => isCreatedToday(report.created_at))),
                statItem("issued", stats.issued, countBy(reports, (report) => statusOf(report) === "git_issued")),
            ];
        }
        case "general-user": {
            const incomplete = countBy(reports, (report) => statusOf(report) !== "resolved");
            if (reports.length === 0) {
                return [{ key: "cta", kind: "cta", label: "", display: panel.roleStatsCta }];
            }
            return [statItem("incomplete", stats.incomplete, incomplete)];
        }
        case "general":
        default:
            return [
                statItem("found", panel.statsFound, fallbackStats.found),
                statItem("resolved", panel.statsResolved, fallbackStats.resolved),
                statItem("inProgress", panel.statsInProgress, fallbackStats.inProgress),
            ];
    }
}
//# sourceMappingURL=panelRoleStats.js.map