import { TARGET_COLOR } from "../constants/report.js";
export function hasReply(report) {
    return report.replies.length > 0;
}
export function getReplyStatusTone(hasCompletedReply) {
    return hasCompletedReply
        ? { backgroundColor: "var(--adaptive-green50)", color: "var(--adaptive-green700)" }
        : { backgroundColor: "var(--adaptive-red50)", color: "var(--adaptive-red700)" };
}
export function getMarkerColor(report) {
    return hasReply(report) ? "var(--adaptive-green500)" : TARGET_COLOR[report.report_type];
}
export function getStatusTone(status) {
    if (status === "resolved") {
        return { backgroundColor: "var(--adaptive-green50)", color: "var(--adaptive-green700)" };
    }
    if (status === "archived") {
        return { backgroundColor: "var(--adaptive-grey100)", color: "var(--adaptive-grey700)" };
    }
    return { backgroundColor: "var(--adaptive-blue50)", color: "var(--adaptive-blue700)" };
}
//# sourceMappingURL=reportVisual.js.map