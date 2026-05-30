import type { useReportState } from "./useReportState.js";
type ReportShortcutHandlers = Pick<ReturnType<typeof useReportState>, "mode" | "draft" | "editingReportId" | "toggleReportMode" | "toggleTargetPreview" | "toggleViewMode" | "cancelDraft" | "handleCreateSubmit" | "stopEditing" | "handleUpdateSubmit">;
export declare function useReportShortcuts(handlers: ReportShortcutHandlers): void;
export {};
//# sourceMappingURL=useReportShortcuts.d.ts.map