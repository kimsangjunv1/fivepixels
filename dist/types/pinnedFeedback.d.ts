export type PinnedFeedbackItem = {
    reportId: string;
    caseId?: string | null;
    pathname: string;
    summary: string;
    pinnedAt: string;
};
export type PinnedFeedbackPreference = {
    items: PinnedFeedbackItem[];
    railCollapsed: boolean;
};
export declare const MAX_PINNED_FEEDBACK = 7;
//# sourceMappingURL=pinnedFeedback.d.ts.map