import type { ReportFeedback, ReportField } from "@/shared/types/report.js";
import type { DraftReport } from "@/shared/types/report-ui.js";
import { createInitialFieldValues } from "@/shared/utils/report/fields.js";
import { clampRatio } from "@/shared/utils/marker/coordinates.js";

/** Hydrate the create-draft tooltip shape from an existing feedback report. */
export function buildDraftFromReport(report: ReportFeedback, fields: ReportField[]): DraftReport {
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
        viewPath: report.position.viewPath ?? [],
        suggestedReportId: null,
        cases: report.cases.map((item) => ({ ...item })),
        category: report.category ?? null,
        fieldValues: createInitialFieldValues(fields, report.field_values),
    };
}
