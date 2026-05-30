import { useEffect } from "react";
import { REPORT_SHORTCUTS } from "../constants/reportShortcuts.js";
import { isEditableTarget, matchesShortcut } from "../utils/shortcuts.js";
export function useReportShortcuts(handlers) {
    const { mode, draft, editingReportId, toggleReportMode, toggleTargetPreview, toggleViewMode, cancelDraft, handleCreateSubmit, stopEditing, handleUpdateSubmit, } = handlers;
    useEffect(() => {
        const handleKeyDown = (event) => {
            const inEditable = isEditableTarget(event.target);
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
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
        cancelDraft,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
    ]);
}
//# sourceMappingURL=useReportShortcuts.js.map