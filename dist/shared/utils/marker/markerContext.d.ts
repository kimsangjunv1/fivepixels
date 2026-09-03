import type { ReportFeedback } from "../../../shared/types/report.js";
import type { MarkerDetachedKind } from "../../../shared/types/report-ui.js";
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
export declare function usesViewportDetachedCoords(report: Pick<ReportFeedback, "position">): boolean;
export declare function resolveDetachedKind(report: Pick<ReportFeedback, "report_id" | "position">, targetElement: HTMLElement | null, detached: boolean): MarkerDetachedKind;
export declare function formatModalReportLabel(reportId: string): string;
/**
 * Renders a consistent centered modal silhouette. Saved viewport ratios are
 * intentionally ignored — they drift after scroll/resize and confuse users.
 */
export declare function getModalGhostFrame(_report?: Pick<ReportFeedback, "position">): ModalGhostFrame;
export declare function getDetachedMarkerHint(detachedKind: MarkerDetachedKind, messages: {
    detachedHint: string;
    detachedModalHint: string;
}): string | null;
export declare function getDetachedMarkerAriaLabel(detachedKind: MarkerDetachedKind, messages: {
    detachedAriaLabel: string;
    detachedModalAriaLabel: string;
}): string;
//# sourceMappingURL=markerContext.d.ts.map