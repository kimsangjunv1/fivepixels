export const FEEDBACK_CATEGORIES = ["incident", "problem", "suggestion", "question", "memo"] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

/** Categories selectable in the feedback composer UI (excludes memo). */
export const SELECTABLE_FEEDBACK_CATEGORIES = ["incident", "problem", "suggestion", "question"] as const satisfies readonly FeedbackCategory[];

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
    return typeof value === "string" && (FEEDBACK_CATEGORIES as readonly string[]).includes(value);
}

export type FeedbackListStatusTag = "no_assignee" | "processed" | "resolved";
