import type { ReportCaseStatus } from "./report.js";

export type DockEdge = "left" | "right";

/** Free-floating pin window position in viewport coordinates. */
export type PinRailPlacement = {
    left: number;
    top: number;
};

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
    placement: PinRailPlacement;
};

export const MAX_PINNED_FEEDBACK = 7;
