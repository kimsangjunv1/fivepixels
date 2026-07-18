import type { ReportFeedback } from "../../types/report.js";
import { type PinnedFeedbackItem, type PinnedFeedbackPreference } from "../../types/pinnedFeedback.js";
export declare function getPinnedFeedbackStorageKey(projectId: string, environment?: string): string;
export declare function sanitizePinnedFeedbackPreference(value: unknown): PinnedFeedbackPreference;
export declare function createPinnedFeedbackItem(report: ReportFeedback, options?: {
    caseId?: string | null;
    summaryMore?: (count: number) => string;
}): PinnedFeedbackItem;
export declare function isFeedbackPinned(items: PinnedFeedbackItem[], reportId: string): boolean;
export declare function togglePinnedFeedbackItem(items: PinnedFeedbackItem[], nextItem: PinnedFeedbackItem): PinnedFeedbackItem[];
export declare function removePinnedFeedbackItem(items: PinnedFeedbackItem[], reportId: string): PinnedFeedbackItem[];
//# sourceMappingURL=pinnedFeedback.d.ts.map