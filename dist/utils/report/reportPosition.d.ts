import type { ReportPosition, ReportPositionAnchor, ReportPositionRatio, ReportPositionViewport } from "../../types/report.js";
/** Coerce missing/partial API position payloads into a render-safe ReportPosition. */
export declare function normalizeReportPosition(value: unknown): ReportPosition;
export declare function getDocumentY(position: ReportPosition): number;
export declare function createReportPosition(overrides?: {
    target?: ReportPositionRatio | null;
    viewport?: Partial<ReportPositionViewport>;
    scrollY?: number;
    anchor?: ReportPositionAnchor | null;
}): ReportPosition;
//# sourceMappingURL=reportPosition.d.ts.map