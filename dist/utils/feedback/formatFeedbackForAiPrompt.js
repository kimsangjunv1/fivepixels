import { getReportReplies } from "../../utils/feedback/feedbackThread.js";
import { mentionMessageToPlainText } from "../../utils/mention/elementMentions.js";
import { getCaseById, getCaseLabels, getReportCases, getRepliesForCase, getResolvedCaseCount } from "../../utils/report/reportCases.js";
const MODIFICATION_REPLY_STATUSES = new Set(["suggested", "found_error", "additional_question"]);
const REVIEW_REPLY_STATUSES = new Set(["recheck_requested", "found_error", "resolved", "suggested"]);
function scopeFeedback(feedback, caseId) {
    const caseItem = getCaseById(feedback, caseId);
    if (!caseItem) {
        return null;
    }
    return {
        ...feedback,
        cases: [caseItem],
        replies: getRepliesForCase(feedback, caseId),
    };
}
function resolveScopedFeedback(feedback, options) {
    if (options.scope === "full") {
        return feedback;
    }
    if (!options.caseId) {
        return null;
    }
    return scopeFeedback(feedback, options.caseId);
}
function resolvePromptHeader(options, labels) {
    if (options.scope === "selectedCase") {
        return {
            title: labels.selectedCaseReviewTitle,
            instruction: labels.selectedCaseReviewInstruction,
        };
    }
    if (options.scope === "thread") {
        return options.intent === "modification"
            ? {
                title: labels.threadModificationTitle,
                instruction: labels.threadModificationInstruction,
            }
            : {
                title: labels.threadReviewTitle,
                instruction: labels.threadReviewInstruction,
            };
    }
    return options.intent === "modification"
        ? {
            title: labels.modificationTitle,
            instruction: labels.modificationInstruction,
        }
        : {
            title: labels.reviewTitle,
            instruction: labels.reviewInstruction,
        };
}
function formatCheckboxTags(feedback, fields) {
    const labels = new Map(fields.map((field) => [field.key, field.label]));
    return Object.entries(feedback.field_values)
        .filter(([key, value]) => key !== "message" && value === true)
        .map(([key]) => labels.get(key) ?? key)
        .join(", ");
}
function formatCaseLine(text, status, needsVerificationLabel) {
    const checkbox = status === "resolved" ? "x" : " ";
    const suffix = needsVerificationLabel ? ` (${needsVerificationLabel})` : "";
    return `- [${checkbox}] ${text}${suffix}`;
}
function formatCasesSection(feedback, intent, scope, labels) {
    const cases = getReportCases(feedback);
    if (cases.length === 0) {
        return labels.noCases;
    }
    const resolved = getResolvedCaseCount(feedback);
    const progress = labels.progress(resolved, cases.length);
    const heading = scope === "selectedCase"
        ? labels.selectedCaseHeading
        : scope === "thread"
            ? labels.threadCaseHeading
            : intent === "modification"
                ? labels.openCases
                : labels.allCases;
    if (scope === "selectedCase" || scope === "thread") {
        const caseItem = cases[0];
        if (!caseItem) {
            return labels.noCases;
        }
        return [
            heading,
            formatCaseLine(mentionMessageToPlainText(caseItem.text, caseItem.mentions), caseItem.status, intent === "review" && caseItem.status === "resolved" ? labels.needsVerification : undefined),
        ].join("\n");
    }
    if (intent === "modification") {
        const openCases = cases.filter((item) => item.status === "open");
        if (openCases.length === 0) {
            return [heading, progress, labels.noOpenCases].join("\n");
        }
        return [
            heading,
            progress,
            ...openCases.map((item) => formatCaseLine(mentionMessageToPlainText(item.text, item.mentions), item.status)),
        ].join("\n");
    }
    return [
        heading,
        progress,
        ...cases.map((item) => formatCaseLine(mentionMessageToPlainText(item.text, item.mentions), item.status, item.status === "resolved" ? labels.needsVerification : undefined)),
    ].join("\n");
}
function formatReplyMessage(reply) {
    return mentionMessageToPlainText(reply.message, reply.mentions);
}
function formatThreadEntry(feedback, reply, labels) {
    const caseLabels = getCaseLabels(feedback, reply.case_ids ?? []);
    const statusLabel = labels.replyStatus(reply.status);
    const lines = [`[${reply.created_at}] ${reply.author_name ?? "-"} (${statusLabel})`, `> ${formatReplyMessage(reply)}`];
    if (caseLabels.length > 0) {
        lines.push(`  ${labels.caseLabel}: ${caseLabels.join(", ")}`);
    }
    return lines.join("\n");
}
function formatThreadSection(feedback, intent, labels) {
    const replies = getReportReplies(feedback);
    if (replies.length === 0) {
        return labels.noReplies;
    }
    const filtered = intent === "modification"
        ? replies.filter((reply) => MODIFICATION_REPLY_STATUSES.has(reply.status))
        : replies.filter((reply) => REVIEW_REPLY_STATUSES.has(reply.status));
    const threadReplies = filtered.length > 0 ? filtered : replies;
    return threadReplies.map((reply) => formatThreadEntry(feedback, reply, labels)).join("\n\n");
}
function formatModificationRepliesSection(feedback, labels) {
    const replies = getReportReplies(feedback).filter((reply) => MODIFICATION_REPLY_STATUSES.has(reply.status));
    if (replies.length === 0) {
        return "";
    }
    return [labels.modificationReplies, ...replies.map((reply) => formatThreadEntry(feedback, reply, labels))].join("\n\n");
}
function formatReviewChecklist(labels) {
    return [labels.reviewChecklist, `1. ${labels.reviewChecklistItem1}`, `2. ${labels.reviewChecklistItem2}`, `3. ${labels.reviewChecklistItem3}`].join("\n");
}
function formatContextSection(feedback, fields, labels) {
    const tags = formatCheckboxTags(feedback, fields);
    return [
        labels.context,
        `- ${labels.path}: ${feedback.pathname}`,
        `- ${labels.reportId}: ${feedback.report_id}`,
        `- ${labels.element}: data-report-id="${feedback.report_id}" (${feedback.report_type ?? "item"})`,
        `- ${labels.author}: ${feedback.author_name ?? "-"}`,
        `- ${labels.position}: (${feedback.position.viewport.x}, ${feedback.position.viewport.y})`,
        `- ${labels.tags}: ${tags || "-"}`,
        `- ${labels.env}: ${feedback.environment ?? "-"}`,
        `- ${labels.version}: ${feedback.app_version ?? "-"}`,
        `- ${labels.feedbackId}: ${feedback.id}`,
    ].join("\n");
}
export function buildAiPromptLabels(messages) {
    return {
        ...messages.marker.askAi.prompt,
        replyStatus: (status) => messages.status.feedback[status] ?? status,
    };
}
export function formatFeedbackForAiPrompt(feedback, fields, options, labels) {
    const scopedFeedback = resolveScopedFeedback(feedback, options);
    if (!scopedFeedback) {
        return "";
    }
    const { title, instruction } = resolvePromptHeader(options, labels);
    const sections = [title, "", instruction, "", formatCasesSection(scopedFeedback, options.intent, options.scope, labels)];
    if (options.intent === "modification") {
        const modificationReplies = formatModificationRepliesSection(scopedFeedback, labels);
        if (modificationReplies) {
            sections.push("", modificationReplies);
        }
    }
    else {
        sections.push("", formatReviewChecklist(labels));
    }
    sections.push("", formatContextSection(feedback, fields, labels), "", labels.thread, formatThreadSection(scopedFeedback, options.intent, labels));
    return sections.join("\n");
}
//# sourceMappingURL=formatFeedbackForAiPrompt.js.map