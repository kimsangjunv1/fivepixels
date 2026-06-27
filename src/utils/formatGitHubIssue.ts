import type { ReportFeedback, ReportField } from "@/types/report.js";
import { getReportReplies } from "@/utils/feedbackThread.js";

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

export function formatFeedbackAsGitHubIssueBody(feedback: ReportFeedback, fields: ReportField[] = []) {
    const tags = formatCheckboxTags(feedback, fields);
    const threadRows = getReportReplies(feedback)
        .map(
            (reply) =>
                `| ${reply.created_at} | ${escapeMarkdownTableCell(reply.author_name ?? "-")} | ${reply.status} | ${escapeMarkdownTableCell(reply.message)} |`,
        )
        .join("\n");

    return [
        "## Summary",
        feedback.message,
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
        "| Time | Author | Status | Message |",
        "|---|---|---|---|",
        threadRows || "| - | - | - | (no replies yet) |",
        "",
        `> fivepixels feedback id: \`${feedback.id}\``,
    ].join("\n");
}
