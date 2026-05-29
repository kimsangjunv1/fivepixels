import type { ReportFeedback } from "../types/report.js";
import type { Marker } from "../types/report-ui.js";
export declare function clampRatio(value: number): number;
export declare function getMarkerFromReport(report: ReportFeedback, currentScrollY: number): Marker;
export declare function resolveTooltipAnchor(markers: Marker[], reportId: string | null): Marker | null;
//# sourceMappingURL=coordinates.d.ts.map