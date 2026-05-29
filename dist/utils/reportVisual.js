import { TARGET_COLOR } from "../constants/report.js";
export function hasReply(report) {
    return report.replies.length > 0;
}
export function getReplyStatusTone(hasCompletedReply) {
    return hasCompletedReply ? { backgroundColor: "#dcfce7", color: "#166534" } : { backgroundColor: "#fee2e2", color: "#b91c1c" };
}
export function getMarkerColor(report) {
    return hasReply(report) ? "#22c55e" : TARGET_COLOR[report.report_type];
}
export function getStatusTone(status) {
    if (status === "resolved") {
        return { backgroundColor: "#dcfce7", color: "#166534" };
    }
    if (status === "archived") {
        return { backgroundColor: "#e2e8f0", color: "#475569" };
    }
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
}
//# sourceMappingURL=reportVisual.js.map