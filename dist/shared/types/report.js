export const REPORT_STATUS_FLOW = ["open", "git_issued", "resolved", "archived"];
export const REPORT_STATUS_TRANSITIONS = {
    open: ["git_issued", "resolved", "archived"],
    git_issued: ["open", "resolved", "archived"],
    resolved: ["open", "archived"],
    archived: [],
};
//# sourceMappingURL=report.js.map