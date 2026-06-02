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
export type DraftPopoverPlacement = "right" | "left" | "bottom" | "top";
export type DraftPopoverTailCorner = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export declare const DRAFT_POPOVER_WIDTH = 280;
export declare const DRAFT_POPOVER_HEIGHT = 228;
export declare const DRAFT_POPOVER_GAP = 10;
export declare const DRAFT_POPOVER_MARGIN = 16;
/** Horizontal line from bubble edge to marker center. */
export declare const DRAFT_POPOVER_CONNECTOR_WIDTH: number;
/** Nudge popover upward when vertically centered on the marker. */
export declare const DRAFT_POPOVER_VERTICAL_NUDGE = 16;
export declare function getDraftPopoverPosition(anchor: Pick<Marker, "left" | "top">, options?: {
    width?: number;
    height?: number;
    viewportWidth?: number;
    viewportHeight?: number;
}): {
    width: number;
    placement: DraftPopoverPlacement;
    centerVertically: boolean;
    tailCorner: DraftPopoverTailCorner;
    left: number;
    anchorCenterY: number;
    top?: undefined;
} | {
    width: number;
    placement: DraftPopoverPlacement;
    centerVertically: boolean;
    tailCorner: DraftPopoverTailCorner;
    left: number;
    top: number;
    anchorCenterY?: undefined;
};
//# sourceMappingURL=coordinates.d.ts.map