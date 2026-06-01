import type { ReportFeedback } from "../types/report.js";
import type { Marker } from "../types/report-ui.js";
export declare function clampRatio(value: number): number;
export declare function getMarkerFromReport(report: ReportFeedback, currentScrollY: number): Marker;
export declare function resolveTooltipAnchor(markers: Marker[], reportId: string | null): Marker | null;
export declare function getTooltipPosition(anchor: Pick<Marker, "left" | "top">, expanded: boolean): {
    left: number;
    top: number;
    width: number;
};
//# sourceMappingURL=coordinates.d.ts.map