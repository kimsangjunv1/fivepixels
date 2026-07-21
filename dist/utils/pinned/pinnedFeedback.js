import { MAX_PINNED_FEEDBACK } from "../../types/pinnedFeedback.js";
import { getCaseById, getIssueSummary } from "../../utils/report/reportCases.js";
const EMPTY_PREFERENCE = {
    items: [],
    railCollapsed: false,
};
export function getPinnedFeedbackStorageKey(projectId, environment) {
    return ["fivepixels:pinned-feedback:v1", projectId, environment].filter(Boolean).join(":");
}
function isPinnedFeedbackItem(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const item = value;
    return typeof item.reportId === "string" && typeof item.pathname === "string" && typeof item.summary === "string" && typeof item.pinnedAt === "string";
}
function sanitizePinnedFeedbackItem(item) {
    const fcNumber = typeof item.fcNumber === "number" && Number.isFinite(item.fcNumber) && item.fcNumber > 0
        ? Math.trunc(item.fcNumber)
        : null;
    const cases = Array.isArray(item.cases)
        ? item.cases.filter((caseItem) => Boolean(caseItem) &&
            typeof caseItem.id === "string" &&
            (caseItem.status === "open" || caseItem.status === "resolved"))
        : [];
    return {
        ...item,
        caseId: typeof item.caseId === "string" ? item.caseId : null,
        fcNumber,
        cases,
    };
}
export function sanitizePinnedFeedbackPreference(value) {
    if (!value || typeof value !== "object") {
        return EMPTY_PREFERENCE;
    }
    const raw = value;
    const items = Array.isArray(raw.items)
        ? raw.items.filter(isPinnedFeedbackItem).map(sanitizePinnedFeedbackItem).slice(0, MAX_PINNED_FEEDBACK)
        : [];
    return {
        items,
        railCollapsed: Boolean(raw.railCollapsed),
    };
}
export function getPinnedFeedbackCaseProgress(items) {
    const cases = items.flatMap((item) => item.cases ?? []);
    const resolved = cases.filter((item) => item.status === "resolved").length;
    const total = cases.length;
    return {
        resolved,
        total,
        percentage: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
}
export function createPinnedFeedbackItem(report, options) {
    const caseId = options?.caseId ?? null;
    const caseText = caseId ? getCaseById(report, caseId)?.text?.trim() : null;
    const summary = caseText || getIssueSummary(report, { summaryMore: options?.summaryMore });
    return {
        reportId: report.id,
        caseId,
        fcNumber: report.fc_number ?? null,
        pathname: report.pathname,
        summary: summary.slice(0, 120),
        cases: report.cases.map((item) => ({
            id: item.id,
            status: item.status,
        })),
        pinnedAt: new Date().toISOString(),
    };
}
export function isFeedbackPinned(items, reportId) {
    return items.some((item) => item.reportId === reportId);
}
export function togglePinnedFeedbackItem(items, nextItem) {
    if (items.some((item) => item.reportId === nextItem.reportId)) {
        return items.filter((item) => item.reportId !== nextItem.reportId);
    }
    const withoutOldest = items.length >= MAX_PINNED_FEEDBACK ? items.slice(items.length - MAX_PINNED_FEEDBACK + 1) : items;
    return [...withoutOldest, nextItem];
}
export function removePinnedFeedbackItem(items, reportId) {
    return items.filter((item) => item.reportId !== reportId);
}
//# sourceMappingURL=pinnedFeedback.js.map