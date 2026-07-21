import type { PinnedFeedbackItem } from "../types/pinnedFeedback.js";
import type { ReportFeedback } from "../types/report.js";
export declare function usePinnedFeedbackPreference(projectId: string, environment?: string): {
    pinnedFeedbackItems: PinnedFeedbackItem[];
    pinRailCollapsed: boolean;
    togglePinnedFeedback: (item: PinnedFeedbackItem) => void;
    unpinFeedback: (reportId: string) => void;
    setPinRailCollapsed: (railCollapsed: boolean) => void;
    syncPinnedFeedbackReports: (reports: ReportFeedback[]) => void;
};
//# sourceMappingURL=usePinnedFeedbackPreference.d.ts.map