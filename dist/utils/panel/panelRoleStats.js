import { getFeedbackDisplayStatus, getReportReplies } from "../../utils/feedback/feedbackThread.js";
import { getReportCases } from "../../utils/report/reportCases.js";
import { formatStatCount } from "../../utils/panel/formatStatCount.js";
function isAssignedTo(report, actorName) {
    if (!actorName) {
        return false;
    }
    return getReportCases(report).some((item) => item.assignee_name?.trim() === actorName);
}
function isCreatedBy(report, actorName) {
    if (!actorName) {
        return false;
    }
    return report.author_name?.trim() === actorName;
}
function hasReplyBy(report, actorName) {
    if (!actorName) {
        return false;
    }
    return getReportReplies(report).some((reply) => {
        if (reply.author_type === "system") {
            return false;
        }
        return reply.author_name?.trim() === actorName;
    });
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
/** Shared header stats for every panel role: created / replied / assigned. */
export function buildPanelRoleStats({ reports, actorName, messages }) {
    const stats = messages.panel.roleStats;
    const statusOf = (report) => getFeedbackDisplayStatus(report, true);
    return [
        statItem("created", stats.created, countBy(reports, (report) => isCreatedBy(report, actorName))),
        statItem("replied", stats.replied, countBy(reports, (report) => hasReplyBy(report, actorName))),
        statItem("mine", stats.mine, countBy(reports, (report) => statusOf(report) !== "resolved" && isAssignedTo(report, actorName))),
    ];
}
//# sourceMappingURL=panelRoleStats.js.map