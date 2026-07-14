export declare const FEEDBACK_CATEGORIES: readonly ["incident", "problem", "suggestion", "question"];
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export declare function isFeedbackCategory(value: unknown): value is FeedbackCategory;
export type FeedbackListStatusTag = "no_assignee" | "processed" | "resolved";
//# sourceMappingURL=feedbackCategory.d.ts.map