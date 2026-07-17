import type { ReportFeedback } from "@/types/report.js";
import { getFeedbackDisplayStatus } from "@/utils/feedback/feedbackThread.js";
import { getReportCases } from "@/utils/report/reportCases.js";
import { isCreatedToday } from "@/utils/panel/routeDetailStatus.js";

const NEEDS_REPLY_STATUSES = new Set(["wait_for_reply", "additional_question"]);
const ATTENTION_STATUSES = new Set(["found_error", "recheck_requested", "wait_for_reply", "additional_question"]);
const IN_PROGRESS_STATUSES = new Set(["wait_for_reply", "additional_question", "suggested", "found_error", "recheck_requested"]);

/** Prefer all-page reports when list scope is "all" or an all-page list is already loaded. */
export function resolveExperimentalListSource(reports: ReportFeedback[], allPageReports: ReportFeedback[], listScope: string) {
    if (listScope === "all" || allPageReports.length > 0) {
        return allPageReports.length > 0 ? allPageReports : reports;
    }

    return reports;
}

function isAssignedTo(report: ReportFeedback, actorName: string | null) {
    if (!actorName) {
        return false;
    }

    return getReportCases(report).some((item) => item.assignee_name?.trim() === actorName);
}

function statusOf(report: ReportFeedback) {
    return getFeedbackDisplayStatus(report, true);
}

export function getCaseCount(report: ReportFeedback) {
    return getReportCases(report).length;
}

export function filterMyTasks(reports: ReportFeedback[], actorName: string | null) {
    return reports.filter((report) => {
        const status = statusOf(report);

        if (status === "resolved") {
            return false;
        }

        return isAssignedTo(report, actorName) || NEEDS_REPLY_STATUSES.has(status) || status === "recheck_requested";
    });
}

export function filterNeedsAttention(reports: ReportFeedback[]) {
    return reports.filter((report) => ATTENTION_STATUSES.has(statusOf(report)));
}

export function filterTodayDigest(reports: ReportFeedback[], now = new Date()) {
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

export type PageBriefSummary = {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    topStatuses: { status: ReturnType<typeof getFeedbackDisplayStatus>; count: number }[];
};

export function buildPageBriefSummary(reports: ReportFeedback[]): PageBriefSummary {
    const statusCounts = new Map<ReturnType<typeof getFeedbackDisplayStatus>, number>();
    let open = 0;
    let inProgress = 0;
    let resolved = 0;

    for (const report of reports) {
        const status = statusOf(report);
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);

        if (status === "resolved") {
            resolved += 1;
        } else {
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

export type ProjectHealthSummary = {
    total: number;
    open: number;
    resolved: number;
    completionRate: number | null;
    todayNew: number;
    gitIssued: number;
    errors: number;
    recheck: number;
};

export function buildProjectHealthSummary(reports: ReportFeedback[], now = new Date()): ProjectHealthSummary {
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
        } else {
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
