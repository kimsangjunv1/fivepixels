import type { ReportReplyStatus } from "@/types/report.js";

export type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | "git_issued" | ReportReplyStatus;

export const FEEDBACK_STATUS_LABEL: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "CURRENTLY WAIT",
    wait_for_reply: "WAIT FOR REPLY",
    git_issued: "GIT ISSUED",
    suggested: "SUGGESTED",
    found_error: "FOUND ERROR",
    resolved: "RESOLVED",
};

export const FEEDBACK_STATUS_COLOR: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "var(--adaptive-orange500)",
    wait_for_reply: "var(--adaptive-orange500)",
    git_issued: "var(--adaptive-blue500)",
    suggested: "var(--adaptive-orange500)",
    found_error: "var(--adaptive-red400)",
    resolved: "var(--adaptive-green500)",
};
