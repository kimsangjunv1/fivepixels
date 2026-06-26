import type { ReportReplyStatus } from "@/types/report.js";

export type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | "git_issued" | ReportReplyStatus;

export const FEEDBACK_STATUS_LABEL: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "CURRENTLY WAIT",
    wait_for_reply: "WAIT FOR REPLY",
    git_issued: "GIT ISSUED",
    suggested: "REQUEST CONFIRM",
    found_error: "FOUND ERROR",
    recheck_requested: "IS NOT ERROR",
    resolved: "RESOLVED",
};

export const FEEDBACK_STATUS_COLOR: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "#808080",
    wait_for_reply: "#808080",
    git_issued: "#5894CC",
    suggested: "#ED9F18",
    found_error: "#D62F2F",
    recheck_requested: "#AF2CD6",
    resolved: "#91B01C",
};

export const FEEDBACK_DISPLAY_STATUS_ORDER: FeedbackDisplayStatus[] = [
    "wait_for_reply",
    "suggested",
    "found_error",
    "recheck_requested",
    "git_issued",
    "resolved",
];
