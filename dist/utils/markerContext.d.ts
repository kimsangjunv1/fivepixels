import type { ReportFeedback } from "../types/report.js";
import type { MarkerDetachedKind } from "../types/report-ui.js";
export type ModalGhostFrame = {
    backdrop: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    dialog: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
};
export declare function isModalReportId(reportId: string): boolean;
export declare function usesViewportDetachedCoords(report: Pick<ReportFeedback, "anchor_report_id" | "viewport_width">): boolean;
export declare function resolveDetachedKind(report: Pick<ReportFeedback, "report_id" | "anchor_report_id" | "viewport_width">, targetElement: HTMLElement | null, detached: boolean): MarkerDetachedKind;
export declare function formatModalReportLabel(reportId: string): string;
export declare function getModalGhostFrame(report: Pick<ReportFeedback, "x_ratio" | "y_ratio" | "viewport_width" | "viewport_height">): ModalGhostFrame;
export declare function getDetachedMarkerHint(detachedKind: MarkerDetachedKind, messages: {
    detachedHint: string;
    detachedModalHint: string;
}): string | null;
export declare function getDetachedMarkerAriaLabel(detachedKind: MarkerDetachedKind, messages: {
    detachedAriaLabel: string;
    detachedModalAriaLabel: string;
}): string;
//# sourceMappingURL=markerContext.d.ts.map