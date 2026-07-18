import type { ReportFeedback } from "@/types/report.js";
import { MAX_PINNED_FEEDBACK, type PinnedFeedbackItem, type PinnedFeedbackPreference } from "@/types/pinnedFeedback.js";
import { getCaseById, getIssueSummary } from "@/utils/report/reportCases.js";

const EMPTY_PREFERENCE: PinnedFeedbackPreference = {
    items: [],
    railCollapsed: false,
};

export function getPinnedFeedbackStorageKey(projectId: string, environment?: string) {
    return ["fivepixels:pinned-feedback:v1", projectId, environment].filter(Boolean).join(":");
}

function isPinnedFeedbackItem(value: unknown): value is PinnedFeedbackItem {
    if (!value || typeof value !== "object") {
        return false;
    }

    const item = value as Partial<PinnedFeedbackItem>;

    return typeof item.reportId === "string" && typeof item.pathname === "string" && typeof item.summary === "string" && typeof item.pinnedAt === "string";
}

export function sanitizePinnedFeedbackPreference(value: unknown): PinnedFeedbackPreference {
    if (!value || typeof value !== "object") {
        return EMPTY_PREFERENCE;
    }

    const raw = value as Partial<PinnedFeedbackPreference>;
    const items = Array.isArray(raw.items) ? raw.items.filter(isPinnedFeedbackItem).slice(0, MAX_PINNED_FEEDBACK) : [];

    return {
        items,
        railCollapsed: Boolean(raw.railCollapsed),
    };
}

export function createPinnedFeedbackItem(
    report: ReportFeedback,
    options?: {
        caseId?: string | null;
        summaryMore?: (count: number) => string;
    },
): PinnedFeedbackItem {
    const caseId = options?.caseId ?? null;
    const caseText = caseId ? getCaseById(report, caseId)?.text?.trim() : null;
    const summary = caseText || getIssueSummary(report, { summaryMore: options?.summaryMore });

    return {
        reportId: report.id,
        caseId,
        pathname: report.pathname,
        summary: summary.slice(0, 120),
        pinnedAt: new Date().toISOString(),
    };
}

export function isFeedbackPinned(items: PinnedFeedbackItem[], reportId: string) {
    return items.some((item) => item.reportId === reportId);
}

export function togglePinnedFeedbackItem(items: PinnedFeedbackItem[], nextItem: PinnedFeedbackItem): PinnedFeedbackItem[] {
    if (items.some((item) => item.reportId === nextItem.reportId)) {
        return items.filter((item) => item.reportId !== nextItem.reportId);
    }

    const withoutOldest = items.length >= MAX_PINNED_FEEDBACK ? items.slice(items.length - MAX_PINNED_FEEDBACK + 1) : items;

    return [...withoutOldest, nextItem];
}

export function removePinnedFeedbackItem(items: PinnedFeedbackItem[], reportId: string) {
    return items.filter((item) => item.reportId !== reportId);
}
