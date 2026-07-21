import type { ReportFeedback, ReportField } from "@/types/report.js";
import { getReportReplies } from "@/utils/feedback/feedbackThread.js";
import { getCaseLabels, getReportCases, getResolvedCaseCount } from "@/utils/report/reportCases.js";

function escapeMarkdownTableCell(value: string) {
    return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatCheckboxTags(feedback: ReportFeedback, fields: ReportField[]) {
    const labels = new Map(fields.map((field) => [field.key, field.label]));

    return Object.entries(feedback.field_values)
        .filter(([key, value]) => key !== "message" && value === true)
        .map(([key]) => labels.get(key) ?? key)
        .join(", ");
}

function formatCaseSummary(feedback: ReportFeedback) {
    return getReportCases(feedback)
        .map((item) => `- [${item.status === "resolved" ? "x" : " "}] ${escapeMarkdownTableCell(item.text)}`)
        .join("\n");
}

function formatCaseProgressLine(feedback: ReportFeedback, formatProgress?: (resolved: number, total: number) => string) {
    const total = getReportCases(feedback).length;

    if (total === 0) {
        return "";
    }

    const resolved = getResolvedCaseCount(feedback);
    const formatter = formatProgress ?? ((resolvedCount, totalCount) => `Progress: ${resolvedCount}/${totalCount} resolved`);

    return formatter(resolved, total);
}

export function formatFeedbackAsGitHubIssueBody(
    feedback: ReportFeedback,
    fields: ReportField[] = [],
    options?: { formatProgress?: (resolved: number, total: number) => string },
) {
    const tags = formatCheckboxTags(feedback, fields);
    const progressLine = formatCaseProgressLine(feedback, options?.formatProgress);
    const threadRows = getReportReplies(feedback)
        .map((reply) => {
            const caseLabels = getCaseLabels(feedback, reply.case_ids ?? []);

            return `| ${reply.created_at} | ${escapeMarkdownTableCell(reply.author_name ?? "-")} | ${reply.status} | ${escapeMarkdownTableCell(caseLabels.join(", ") || "-")} | ${escapeMarkdownTableCell(reply.message)} |`;
        })
        .join("\n");

    return [
        "## Cases",
        progressLine,
        formatCaseSummary(feedback) || "- (no cases)",
        "",
        "## Context",
        "| Field | Value |",
        "|---|---|",
        `| Path | ${escapeMarkdownTableCell(feedback.pathname)} |`,
        `| Report ID | ${escapeMarkdownTableCell(feedback.report_id)} |`,
        `| Author | ${escapeMarkdownTableCell(feedback.author_name ?? "-")} |`,
        `| Position | (${feedback.position.viewport.x}, ${feedback.position.viewport.y}) |`,
        `| Tags | ${escapeMarkdownTableCell(tags || "-")} |`,
        `| Env | ${escapeMarkdownTableCell(feedback.environment ?? "-")} |`,
        `| Version | ${escapeMarkdownTableCell(feedback.app_version ?? "-")} |`,
        "",
        "## Thread",
        "| Time | Author | Status | Cases | Message |",
        "|---|---|---|---|---|",
        threadRows || "| - | - | - | - | (no replies yet) |",
        "",
        `> fivepixels feedback id: \`${feedback.id}\``,
    ]
        .filter(Boolean)
        .join("\n");
}
