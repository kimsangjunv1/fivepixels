export function markerToTargetSnapshot(marker) {
    if (!marker.rect) {
        return null;
    }
    const { report, rect } = marker;
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