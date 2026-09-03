import { toFeedbackHoverSnapshot } from "../../../shared/utils/shared/dom.js";
import { getFeedbackTargetElement } from "./locateFeedback.js";
import { getFeedbackViewTrigger } from "./viewRestore.js";
export function markerToTargetSnapshot(marker) {
    if (!marker.rect) {
        return null;
    }
    const { report, rect } = marker;
    const viewTrigger = marker.viewTriggerKey ? (getFeedbackViewTrigger(report.position.viewPath, { visibleOnly: true })?.element ?? null) : null;
    const inspectedViewTrigger = toFeedbackHoverSnapshot(viewTrigger);
    if (inspectedViewTrigger) {
        return inspectedViewTrigger;
    }
    const inspectedTarget = toFeedbackHoverSnapshot(getFeedbackTargetElement(report));
    if (inspectedTarget) {
        return inspectedTarget;
    }
    const isTagged = !report.target_selector;
    return {
        id: report.report_id,
        type: report.report_type,
        rect,
        isTagged,
        targetSelector: report.target_selector ?? null,
        suggestedReportId: isTagged ? null : report.report_id,
    };
}
//# sourceMappingURL=markerTarget.js.map