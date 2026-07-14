import type { useReportState } from "./useReportState.js";
type ReportShortcutHandlers = Pick<ReturnType<typeof useReportState>, "mode" | "draft" | "editingReportId" | "panelTab" | "showTargetPreview" | "activeReplyReportId" | "pendingComposer" | "toggleReportMode" | "toggleTargetPreview" | "toggleIssueMode" | "pickProbeOpen" | "cancelDraft" | "cancelPendingComposer" | "closePickProbe" | "closeReplyComposer" | "handleCreateSubmit" | "stopEditing" | "handleUpdateSubmit" | "focusSearchInput" | "selectAdjacentReport">;
export declare function useReportShortcuts(handlers: ReportShortcutHandlers): void;
export {};
//# sourceMappingURL=useReportShortcuts.d.ts.map