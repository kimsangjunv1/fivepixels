import { ACCENT_COLOR } from "../../shared/constants/accentColors.js";
export const FEEDBACK_STATUS_LABEL = {
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
export const FEEDBACK_STATUS_COLOR = {
    currently_wait: "#808080",
    wait_for_reply: "#808080",
    issue_apply: ACCENT_COLOR.blue,
    git_issued: ACCENT_COLOR.blue,
    suggested: "#ED9F18",
    additional_question: ACCENT_COLOR.blue,
    found_error: ACCENT_COLOR.red,
    recheck_requested: "#AF2CD6",
    resolved: ACCENT_COLOR.green,
    assignee_assigned: ACCENT_COLOR.blue,
    assignee_transferred: ACCENT_COLOR.blue,
};
export const FEEDBACK_DISPLAY_STATUS_ORDER = [
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
//# sourceMappingURL=feedbackStatus.js.map