export const FEEDBACK_STORAGE_CHANGED_EVENT = "fivepixels:feedback-storage-changed";
export function dispatchFeedbackStorageChanged() {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new CustomEvent(FEEDBACK_STORAGE_CHANGED_EVENT));
}
//# sourceMappingURL=feedbackStorageEvents.js.map