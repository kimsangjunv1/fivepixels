export declare const FEEDBACK_CATEGORIES: readonly ["incident", "problem", "suggestion", "question", "memo"];
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
/** Categories selectable in the feedback composer UI (excludes memo). */
export declare const SELECTABLE_FEEDBACK_CATEGORIES: readonly ["incident", "problem", "suggestion", "question"];
export declare function isFeedbackCategory(value: unknown): value is FeedbackCategory;
export type FeedbackListStatusTag = "no_assignee" | "processed" | "resolved";
//# sourceMappingURL=feedbackCategory.d.ts.map