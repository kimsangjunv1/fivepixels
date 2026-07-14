export const FEEDBACK_CATEGORIES = ["incident", "problem", "suggestion", "question"];
export function isFeedbackCategory(value) {
    return typeof value === "string" && FEEDBACK_CATEGORIES.includes(value);
}
//# sourceMappingURL=feedbackCategory.js.map