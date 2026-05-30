export const REPORT_STATUS_FLOW = ["open", "resolved", "archived"];
export const REPORT_STATUS_TRANSITIONS = {
    open: ["resolved", "archived"],
    resolved: ["open", "archived"],
    archived: [],
};
//# sourceMappingURL=report.js.map