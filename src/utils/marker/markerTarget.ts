import type { Marker, TargetSnapshot } from "@/types/report-ui.js";
import { toFeedbackHoverSnapshot } from "@/utils/shared/dom.js";
import { getFeedbackTargetElement } from "./locateFeedback.js";

export function markerToTargetSnapshot(marker: Marker): TargetSnapshot | null {
    if (!marker.rect) {
        return null;
    }

    const { report, rect } = marker;
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
