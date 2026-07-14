import type { ReportPosition, ReportPositionAnchor, ReportPositionRatio, ReportPositionViewport } from "../../types/report.js";
export declare function getDocumentY(position: ReportPosition): number;
export declare function createReportPosition(overrides?: {
    target?: ReportPositionRatio | null;
    viewport?: Partial<ReportPositionViewport>;
    scrollY?: number;
    anchor?: ReportPositionAnchor | null;
}): ReportPosition;
//# sourceMappingURL=reportPosition.d.ts.map