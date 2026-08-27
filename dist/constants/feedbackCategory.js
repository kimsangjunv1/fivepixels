export const FEEDBACK_CATEGORIES = ["incident", "problem", "suggestion", "question", "memo"];
/** Categories selectable in the feedback composer UI (excludes memo). */
export const SELECTABLE_FEEDBACK_CATEGORIES = ["incident", "problem", "suggestion", "question"];
export function isFeedbackCategory(value) {
    return typeof value === "string" && FEEDBACK_CATEGORIES.includes(value);
}
//# sourceMappingURL=feedbackCategory.js.map