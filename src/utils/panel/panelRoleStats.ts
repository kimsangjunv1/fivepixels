import type { ReportMessages } from "@/i18n/types.js";
import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackDisplayStatus, getReportReplies } from "@/utils/feedback/feedbackThread.js";
import { getReportCases } from "@/utils/report/reportCases.js";
import { formatStatCount } from "@/utils/panel/formatStatCount.js";

export type PanelRoleStatItem = {
    key: string;
    kind: "stat" | "cta";
    label: string;
    display: string;
};

function isAssignedTo(report: ReportFeedback, actorName: string | null): boolean {
    if (!actorName) {
        return false;
    }

    return getReportCases(report).some((item) => item.assignee_name?.trim() === actorName);
}

function isCreatedBy(report: ReportFeedback, actorName: string | null): boolean {
    if (!actorName) {
        return false;
    }

    return report.author_name?.trim() === actorName;
}

function hasReplyBy(report: ReportFeedback, actorName: string | null): boolean {
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

function countBy(reports: ReportFeedback[], predicate: (report: ReportFeedback) => boolean): number {
    let count = 0;

    for (const report of reports) {
        if (predicate(report)) {
            count += 1;
        }
    }

    return count;
}

function statItem(key: string, label: string, value: number): PanelRoleStatItem {
    return { key, kind: "stat", label, display: formatStatCount(value) };
}

export type BuildPanelRoleStatsOptions = {
    reports: ReportFeedback[];
    actorName: string | null;
    messages: ReportMessages;
};

/** Shared header stats for every panel role: created / replied / assigned. */
export function buildPanelRoleStats({ reports, actorName, messages }: BuildPanelRoleStatsOptions): PanelRoleStatItem[] {
    const stats = messages.panel.roleStats;
    const statusOf = (report: ReportFeedback) => getFeedbackDisplayStatus(report, true);

    return [
        statItem("created", stats.created, countBy(reports, (report) => isCreatedBy(report, actorName))),
        statItem("replied", stats.replied, countBy(reports, (report) => hasReplyBy(report, actorName))),
        statItem(
            "mine",
            stats.mine,
            countBy(reports, (report) => statusOf(report) !== "resolved" && isAssignedTo(report, actorName)),
        ),
    ];
}
