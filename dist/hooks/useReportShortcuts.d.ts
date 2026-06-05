import type { useReportState } from "./useReportState.js";
type ReportShortcutHandlers = Pick<ReturnType<typeof useReportState>, "mode" | "draft" | "editingReportId" | "panelTab" | "showTargetPreview" | "toggleReportMode" | "toggleTargetPreview" | "toggleIssueMode" | "cancelDraft" | "handleCreateSubmit" | "stopEditing" | "handleUpdateSubmit" | "focusSearchInput" | "selectAdjacentReport">;
export declare function useReportShortcuts(handlers: ReportShortcutHandlers): void;
export {};
//# sourceMappingURL=useReportShortcuts.d.ts.map