import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { FEEDBACK_HIGHLIGHT } from "../../shared/constants/report.js";
import { toFixedLayerPosition, useFixedPositionOrigin } from "../../shared/hooks/useFixedPositionOrigin.js";
import { PickTargetCompareChip } from "./PickTargetCompareChip.js";
import { InspectTooltip } from "./InspectTooltip.js";
const HOVER_HIGHLIGHT_KEY = "hover-active";
const SELECTION_HIGHLIGHT_KEY = "selection-active";
const CONTEXT_MENU_FOCUS_KEY = "context-menu-focus";
const ACTIVE_MARKER_HIGHLIGHT_KEY = "marker-active";
const MENTION_HIGHLIGHT_KEY = "mention-active";
function highlightLabel(target) {
    if (target.isTagged) {
        return `${target.type} · ${target.id}`;
    }
    return `suggested · ${target.suggestedReportId ?? target.id}`;
}
function HighlightBox({ target, showLabel, origin }) {
    const position = toFixedLayerPosition(target.rect.left, target.rect.top, origin);
    return (_jsx("div", { className: "fivepixels-target-highlight pointer-events-none fixed box-border", style: {
            left: position.left,
            top: position.top,
            width: target.rect.width,
            height: target.rect.height,
            borderRadius: target.boxStyle?.borderRadius ?? "0",
            boxShadow: `0 0 0 2px ${FEEDBACK_HIGHLIGHT.outline}`,
            backgroundColor: FEEDBACK_HIGHLIGHT.surface,
        }, children: showLabel ? (_jsx("span", { className: "fivepixels-target-highlight__label absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white", style: { backgroundColor: FEEDBACK_HIGHLIGHT.label }, children: highlightLabel(target) })) : null }));
}
/** Fixed outline for the element that opened the right-click menu (independent of hover). */
function ContextMenuFocusBox({ target, origin }) {
    const position = toFixedLayerPosition(target.rect.left, target.rect.top, origin);
    return (_jsx("div", { className: "fivepixels-context-menu-focus pointer-events-none fixed box-border", "aria-hidden": "true", style: {
            left: position.left,
            top: position.top,
            width: target.rect.width,
            height: target.rect.height,
            borderRadius: target.boxStyle?.borderRadius ?? "0",
        } }));
}
export function TargetHighlights({ hoveredTarget, selectedTarget = null, contextMenuTarget = null, showHoverInspect = false, showSelectionHighlight = false, showPickProbeCompare = false, showActiveMarkerInspect = false, previewTargets = [], markerPreviewTargets = [], activeMarkerTarget, mentionHighlightTarget = null, }) {
    const { origin, originProbe } = useFixedPositionOrigin();
    return (_jsxs(_Fragment, { children: [originProbe, previewTargets.map((target) => (_jsx(HighlightBox, { target: target, origin: origin, showLabel: true }, `preview-${target.type}-${target.id}`))), markerPreviewTargets.map((target) => (_jsx(HighlightBox, { target: target, origin: origin, showLabel: true }, `marker-preview-${target.id}`))), mentionHighlightTarget ? (_jsx(HighlightBox, { target: mentionHighlightTarget, origin: origin, showLabel: true }, MENTION_HIGHLIGHT_KEY)) : null, showHoverInspect && hoveredTarget ? (_jsxs(_Fragment, { children: [_jsx(HighlightBox, { target: hoveredTarget, origin: origin }, HOVER_HIGHLIGHT_KEY), _jsx(InspectTooltip, { target: hoveredTarget })] })) : null, showSelectionHighlight && selectedTarget ? (_jsx(HighlightBox, { target: selectedTarget, origin: origin }, SELECTION_HIGHLIGHT_KEY)) : null, showPickProbeCompare && selectedTarget ? _jsx(PickTargetCompareChip, { target: selectedTarget }) : null, contextMenuTarget ? (_jsx(ContextMenuFocusBox, { target: contextMenuTarget, origin: origin }, CONTEXT_MENU_FOCUS_KEY)) : null, activeMarkerTarget ? (_jsxs(_Fragment, { children: [_jsx(HighlightBox, { target: activeMarkerTarget, origin: origin }, ACTIVE_MARKER_HIGHLIGHT_KEY), showActiveMarkerInspect ? _jsx(InspectTooltip, { target: activeMarkerTarget }) : null] })) : null] }));
}
//# sourceMappingURL=TargetHighlights.js.map