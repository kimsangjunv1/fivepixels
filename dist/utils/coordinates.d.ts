import type { ReportFeedback } from "../types/report.js";
import type { DraftReport, Marker, TargetSnapshot } from "../types/report-ui.js";
export declare function clampRatio(value: number): number;
export declare function getMarkerFromReport(report: ReportFeedback, currentScrollY: number): Marker;
export declare function getDraftMarkerPosition(draft: Pick<DraftReport, "clientX" | "clientY" | "elementXRatio" | "elementYRatio">, selectedTarget: TargetSnapshot | null): {
    left: number;
    top: number;
};
export declare function resolveTooltipAnchor(markers: Marker[], reportId: string | null): Marker | null;
export declare function getTooltipPosition(anchor: Pick<Marker, "left" | "top">, expanded: boolean): {
    left: number;
    top: number;
    width: number;
};
//# sourceMappingURL=coordinates.d.ts.map