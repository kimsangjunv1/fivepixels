import type { ReportReplyStatus } from "../types/report.js";

export type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | ReportReplyStatus;

export const FEEDBACK_STATUS_LABEL: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "CURRENTLY WAIT",
    wait_for_reply: "WAIT FOR REPLY",
    suggested: "SUGGESTED",
    found_error: "FOUND ERROR",
    verified: "VERIFIED",
};

export const FEEDBACK_STATUS_COLOR: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "var(--adaptive-orange500)",
    wait_for_reply: "var(--adaptive-orange500)",
    suggested: "var(--adaptive-orange500)",
    found_error: "var(--adaptive-red400)",
    verified: "var(--adaptive-green500)",
};
