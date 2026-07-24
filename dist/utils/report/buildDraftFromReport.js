import { createInitialFieldValues } from "../../utils/report/fields.js";
import { clampRatio } from "../../utils/marker/coordinates.js";
/** Hydrate the create-draft tooltip shape from an existing feedback report. */
export function buildDraftFromReport(report, fields) {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : report.position.viewport.width;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : report.position.viewport.height;
    const xRatio = clampRatio(report.position.viewport.x);
    const yRatio = clampRatio(report.position.viewport.y);
    const target = report.position.target;
    const anchor = report.position.anchor;
    return {
        clientX: xRatio * viewportWidth,
        clientY: yRatio * viewportHeight,
        xRatio,
        yRatio,
        elementXRatio: clampRatio(target?.x ?? 0.5),
        elementYRatio: clampRatio(target?.y ?? 0.5),
        anchorReportId: anchor?.reportId ?? null,
        anchorReportType: anchor?.reportType ?? null,
        anchorXRatio: anchor ? clampRatio(anchor.x) : null,
        anchorYRatio: anchor ? clampRatio(anchor.y) : null,
        scrollY: report.position.scrollY,
        documentY: Math.round(report.position.scrollY + yRatio * viewportHeight),
        reportId: report.report_id,
        reportType: report.report_type,
        targetSelector: report.target_selector ?? null,
        suggestedReportId: null,
        cases: report.cases.map((item) => ({ ...item })),
        category: report.category ?? null,
        fieldValues: createInitialFieldValues(fields, report.field_values),
    };
}
//# sourceMappingURL=buildDraftFromReport.js.map