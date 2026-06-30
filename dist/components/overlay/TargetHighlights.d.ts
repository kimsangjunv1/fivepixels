import type { TargetSnapshot } from "../../types/report-ui.js";
type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    previewTargets?: TargetSnapshot[];
    markerPreviewTargets?: TargetSnapshot[];
    activeMarkerTarget: TargetSnapshot | null;
};
export declare function TargetHighlights({ hoveredTarget, previewTargets, markerPreviewTargets, activeMarkerTarget, }: TargetHighlightsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TargetHighlights.d.ts.map