import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_HIGHLIGHT } from "../../constants/report.js";
import { PickTargetCompareChip } from "./PickTargetCompareChip.js";
import { PickTargetHoverTooltip } from "./PickTargetHoverTooltip.js";
const HOVER_HIGHLIGHT_KEY = "hover-active";
const SELECTION_HIGHLIGHT_KEY = "selection-active";
const ACTIVE_MARKER_HIGHLIGHT_KEY = "marker-active";
function highlightLabel(target) {
    if (target.isTagged) {
        return `${target.type} · ${target.id}`;
    }
    return `suggested · ${target.suggestedReportId ?? target.id}`;
}
function HighlightBox({ target, showLabel }) {
    return (_jsx("div", { className: "fivepixels-target-highlight pointer-events-none fixed box-border", style: {
            left: target.rect.left,
            top: target.rect.top,
            width: target.rect.width,
            height: target.rect.height,
            outlineWidth: 2,
            outlineStyle: "solid",
            outlineColor: FEEDBACK_HIGHLIGHT.outline,
            backgroundColor: FEEDBACK_HIGHLIGHT.surface,
        }, children: showLabel ? (_jsx("span", { className: "fivepixels-target-highlight__label absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white", style: { backgroundColor: FEEDBACK_HIGHLIGHT.label }, children: highlightLabel(target) })) : null }));
}
export function TargetHighlights({ hoveredTarget, selectedTarget = null, showHoverInspect = false, showSelectionHighlight = false, showPickProbeCompare = false, previewTargets = [], markerPreviewTargets = [], activeMarkerTarget, }) {
    return (_jsxs(_Fragment, { children: [previewTargets.map((target) => (_jsx(HighlightBox, { target: target, showLabel: true }, `preview-${target.type}-${target.id}`))), markerPreviewTargets.map((target) => (_jsx(HighlightBox, { target: target, showLabel: true }, `marker-preview-${target.id}`))), showHoverInspect && hoveredTarget ? (_jsxs(_Fragment, { children: [_jsx(HighlightBox, { target: hoveredTarget }, HOVER_HIGHLIGHT_KEY), _jsx(PickTargetHoverTooltip, { target: hoveredTarget })] })) : null, showSelectionHighlight && selectedTarget ? (_jsxs(_Fragment, { children: [_jsx(HighlightBox, { target: selectedTarget }, SELECTION_HIGHLIGHT_KEY), showPickProbeCompare ? _jsx(PickTargetCompareChip, { target: selectedTarget }) : null] })) : null, activeMarkerTarget ? (_jsx(HighlightBox, { target: activeMarkerTarget, showLabel: true }, ACTIVE_MARKER_HIGHLIGHT_KEY)) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map