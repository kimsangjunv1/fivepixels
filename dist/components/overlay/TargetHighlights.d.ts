import type { TargetSnapshot } from "../../types/report-ui.js";
type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    selectedTarget?: TargetSnapshot | null;
    showHoverInspect?: boolean;
    showSelectionHighlight?: boolean;
    showPickProbeCompare?: boolean;
    previewTargets?: TargetSnapshot[];
    markerPreviewTargets?: TargetSnapshot[];
    activeMarkerTarget: TargetSnapshot | null;
};
export declare function TargetHighlights({ hoveredTarget, selectedTarget, showHoverInspect, showSelectionHighlight, showPickProbeCompare, previewTargets, markerPreviewTargets, activeMarkerTarget, }: TargetHighlightsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TargetHighlights.d.ts.map