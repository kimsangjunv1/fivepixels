import { FEEDBACK_HIGHLIGHT } from "@/shared/constants/report.js";
import { toFixedLayerPosition, useFixedPositionOrigin, type FixedPositionOrigin } from "@/shared/hooks/useFixedPositionOrigin.js";
import type { TargetSnapshot } from "@/shared/types/report-ui.js";
import { PickTargetCompareChip } from "./PickTargetCompareChip.js";
import { InspectTooltip } from "./InspectTooltip.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    selectedTarget?: TargetSnapshot | null;
    contextMenuTarget?: TargetSnapshot | null;
    showHoverInspect?: boolean;
    showSelectionHighlight?: boolean;
    showPickProbeCompare?: boolean;
    showActiveMarkerInspect?: boolean;
    previewTargets?: TargetSnapshot[];
    markerPreviewTargets?: TargetSnapshot[];
    activeMarkerTarget: TargetSnapshot | null;
    mentionHighlightTarget?: TargetSnapshot | null;
};

const HOVER_HIGHLIGHT_KEY = "hover-active";
const SELECTION_HIGHLIGHT_KEY = "selection-active";
const CONTEXT_MENU_FOCUS_KEY = "context-menu-focus";
const ACTIVE_MARKER_HIGHLIGHT_KEY = "marker-active";
const MENTION_HIGHLIGHT_KEY = "mention-active";

function highlightLabel(target: TargetSnapshot) {
    if (target.isTagged) {
        return `${target.type} · ${target.id}`;
    }

    return `suggested · ${target.suggestedReportId ?? target.id}`;
}

function HighlightBox({ target, showLabel, origin }: { target: TargetSnapshot; showLabel?: boolean; origin: FixedPositionOrigin }) {
    const position = toFixedLayerPosition(target.rect.left, target.rect.top, origin);

    return (
        <div
            className="fivepixels-target-highlight pointer-events-none fixed box-border"
            style={{
                left: position.left,
                top: position.top,
                width: target.rect.width,
                height: target.rect.height,
                borderRadius: target.boxStyle?.borderRadius ?? "0",
                boxShadow: `0 0 0 2px ${FEEDBACK_HIGHLIGHT.outline}`,
                backgroundColor: FEEDBACK_HIGHLIGHT.surface,
            }}
        >
            {showLabel ? (
                <span
                    className="fivepixels-target-highlight__label absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white"
                    style={{ backgroundColor: FEEDBACK_HIGHLIGHT.label }}
                >
                    {highlightLabel(target)}
                </span>
            ) : null}
        </div>
    );
}

/** Fixed outline for the element that opened the right-click menu (independent of hover). */
function ContextMenuFocusBox({ target, origin }: { target: TargetSnapshot; origin: FixedPositionOrigin }) {
    const position = toFixedLayerPosition(target.rect.left, target.rect.top, origin);

    return (
        <div
            className="fivepixels-context-menu-focus pointer-events-none fixed box-border"
            aria-hidden="true"
            style={{
                left: position.left,
                top: position.top,
                width: target.rect.width,
                height: target.rect.height,
                borderRadius: target.boxStyle?.borderRadius ?? "0",
            }}
        />
    );
}

export function TargetHighlights({
    hoveredTarget,
    selectedTarget = null,
    contextMenuTarget = null,
    showHoverInspect = false,
    showSelectionHighlight = false,
    showPickProbeCompare = false,
    showActiveMarkerInspect = false,
    previewTargets = [],
    markerPreviewTargets = [],
    activeMarkerTarget,
    mentionHighlightTarget = null,
}: TargetHighlightsProps) {
    const { origin, originProbe } = useFixedPositionOrigin();

    return (
        <>
            {originProbe}
            {previewTargets.map((target) => (
                <HighlightBox
                    key={`preview-${target.type}-${target.id}`}
                    target={target}
                    origin={origin}
                    showLabel
                />
            ))}

            {markerPreviewTargets.map((target) => (
                <HighlightBox
                    key={`marker-preview-${target.id}`}
                    target={target}
                    origin={origin}
                    showLabel
                />
            ))}

            {mentionHighlightTarget ? (
                <HighlightBox
                    key={MENTION_HIGHLIGHT_KEY}
                    target={mentionHighlightTarget}
                    origin={origin}
                    showLabel
                />
            ) : null}

            {showHoverInspect && hoveredTarget ? (
                <>
                    <HighlightBox
                        key={HOVER_HIGHLIGHT_KEY}
                        target={hoveredTarget}
                        origin={origin}
                    />
                    <InspectTooltip target={hoveredTarget} />
                </>
            ) : null}

            {showSelectionHighlight && selectedTarget ? (
                <HighlightBox
                    key={SELECTION_HIGHLIGHT_KEY}
                    target={selectedTarget}
                    origin={origin}
                />
            ) : null}

            {showPickProbeCompare && selectedTarget ? <PickTargetCompareChip target={selectedTarget} /> : null}

            {contextMenuTarget ? (
                <ContextMenuFocusBox
                    key={CONTEXT_MENU_FOCUS_KEY}
                    target={contextMenuTarget}
                    origin={origin}
                />
            ) : null}

            {activeMarkerTarget ? (
                <>
                    <HighlightBox
                        key={ACTIVE_MARKER_HIGHLIGHT_KEY}
                        target={activeMarkerTarget}
                        origin={origin}
                    />
                    {showActiveMarkerInspect ? <InspectTooltip target={activeMarkerTarget} /> : null}
                </>
            ) : null}
        </>
    );
}
