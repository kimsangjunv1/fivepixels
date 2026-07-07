import type { ReportReplyStatus } from "@/types/report.js";

export type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | "issue_apply" | "git_issued" | ReportReplyStatus;

export const FEEDBACK_STATUS_LABEL: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "CURRENTLY WAIT",
    wait_for_reply: "WAIT FOR REPLY",
    issue_apply: "ISSUE APPLY",
    git_issued: "GIT ISSUED",
    suggested: "REQUEST CONFIRM",
    additional_question: "ADDITIONAL QUESTION",
    found_error: "FOUND ERROR",
    recheck_requested: "IS NOT ERROR",
    resolved: "RESOLVED",
    assignee_assigned: "ASSIGNEE ASSIGNED",
    assignee_transferred: "ASSIGNEE TRANSFERRED",
};

export const FEEDBACK_STATUS_COLOR: Record<FeedbackDisplayStatus, string> = {
    currently_wait: "#808080",
    wait_for_reply: "#808080",
    issue_apply: "#5894CC",
    git_issued: "#5894CC",
    suggested: "#ED9F18",
    additional_question: "#5894CC",
    found_error: "#D62F2F",
    recheck_requested: "#AF2CD6",
    resolved: "#91B01C",
    assignee_assigned: "#5894CC",
    assignee_transferred: "#5894CC",
};

export const FEEDBACK_DISPLAY_STATUS_ORDER: FeedbackDisplayStatus[] = [
    "issue_apply",
    "wait_for_reply",
    "additional_question",
    "suggested",
    "found_error",
    "recheck_requested",
    "assignee_assigned",
    "assignee_transferred",
    "git_issued",
    "resolved",
];
