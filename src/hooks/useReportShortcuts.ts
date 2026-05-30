import { useEffect } from "react";
import { REPORT_SHORTCUTS } from "../constants/reportShortcuts.js";
import { isEditableTarget, matchesShortcut } from "../utils/shortcuts.js";
import type { useReportState } from "./useReportState.js";

type ReportShortcutHandlers = Pick<
    ReturnType<typeof useReportState>,
    | "mode"
    | "draft"
    | "editingReportId"
    | "showFeedbackList"
    | "showTargetPreview"
    | "toggleReportMode"
    | "toggleTargetPreview"
    | "toggleViewMode"
    | "cancelDraft"
    | "handleCreateSubmit"
    | "stopEditing"
    | "handleUpdateSubmit"
    | "focusSearchInput"
    | "selectAdjacentReport"
>;

export function useReportShortcuts(handlers: ReportShortcutHandlers) {
    const {
        mode,
        draft,
        editingReportId,
        showFeedbackList,
        showTargetPreview,
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
        cancelDraft,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
        focusSearchInput,
        selectAdjacentReport,
    } = handlers;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const inEditable = isEditableTarget(event.target);
            const isViewListOpen = mode === "view" && showFeedbackList;

            if (matchesShortcut(event, REPORT_SHORTCUTS.submit)) {
                if (draft) {
                    event.preventDefault();
                    void handleCreateSubmit();
                    return;
                }

                if (editingReportId) {
                    event.preventDefault();
                    void handleUpdateSubmit();
                    return;
                }

                return;
            }

            if (matchesShortcut(event, REPORT_SHORTCUTS.cancel)) {
                if (draft) {
                    event.preventDefault();
                    cancelDraft();
                    return;
                }

                if (editingReportId) {
                    event.preventDefault();
                    stopEditing();
                    return;
                }

                if (mode === "report") {
                    event.preventDefault();
                    toggleReportMode();
                    return;
                }

                if (mode === "view") {
                    event.preventDefault();
                    toggleViewMode();
                    return;
                }

                if (showTargetPreview) {
                    event.preventDefault();
                    toggleTargetPreview();
                    return;
                }

                return;
            }

            if (isViewListOpen && matchesShortcut(event, REPORT_SHORTCUTS.focusSearch)) {
                event.preventDefault();
                focusSearchInput();
                return;
            }

            if (isViewListOpen && !inEditable && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                event.preventDefault();
                selectAdjacentReport(event.key === "ArrowDown" ? "down" : "up");
                return;
            }

            if (inEditable) {
                return;
            }

            if (matchesShortcut(event, REPORT_SHORTCUTS.toggleReportMode)) {
                event.preventDefault();
                toggleReportMode();
                return;
            }

            if (matchesShortcut(event, REPORT_SHORTCUTS.toggleTargetPreview)) {
                if (mode !== "idle") {
                    return;
                }

                event.preventDefault();
                toggleTargetPreview();
                return;
            }

            if (matchesShortcut(event, REPORT_SHORTCUTS.toggleViewMode)) {
                event.preventDefault();
                toggleViewMode();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        mode,
        draft,
        editingReportId,
        showFeedbackList,
        showTargetPreview,
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
        cancelDraft,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
        focusSearchInput,
        selectAdjacentReport,
    ]);
}
