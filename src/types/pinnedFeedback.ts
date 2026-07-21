import type { ReportCaseStatus } from "./report.js";

export type PinnedFeedbackCaseSnapshot = {
    id: string;
    status: ReportCaseStatus;
};

export type PinnedFeedbackItem = {
    reportId: string;
    caseId?: string | null;
    fcNumber?: number | null;
    pathname: string;
    summary: string;
    cases?: PinnedFeedbackCaseSnapshot[];
    pinnedAt: string;
};

export type PinnedFeedbackPreference = {
    items: PinnedFeedbackItem[];
    railCollapsed: boolean;
};

export const MAX_PINNED_FEEDBACK = 7;
