import { FEEDBACK_HIGHLIGHT } from "@/constants/report.js";
import type { TargetSnapshot } from "@/types/report-ui.js";
import { PickTargetCompareChip } from "./PickTargetCompareChip.js";
import { PickTargetHoverTooltip } from "./PickTargetHoverTooltip.js";

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

const HOVER_HIGHLIGHT_KEY = "hover-active";
const SELECTION_HIGHLIGHT_KEY = "selection-active";
const ACTIVE_MARKER_HIGHLIGHT_KEY = "marker-active";

function highlightLabel(target: TargetSnapshot) {
    if (target.isTagged) {
        return `${target.type} · ${target.id}`;
    }

    return `suggested · ${target.suggestedReportId ?? target.id}`;
}

function HighlightBox({ target, showLabel }: { target: TargetSnapshot; showLabel?: boolean }) {
    return (
        <div
            className="fivepixels-target-highlight pointer-events-none fixed box-border"
            style={{
                left: target.rect.left,
                top: target.rect.top,
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

export function TargetHighlights({
    hoveredTarget,
    selectedTarget = null,
    showHoverInspect = false,
    showSelectionHighlight = false,
    showPickProbeCompare = false,
    previewTargets = [],
    markerPreviewTargets = [],
    activeMarkerTarget,
}: TargetHighlightsProps) {
    return (
        <>
            {previewTargets.map((target) => (
                <HighlightBox
                    key={`preview-${target.type}-${target.id}`}
                    target={target}
                    showLabel
                />
            ))}

            {markerPreviewTargets.map((target) => (
                <HighlightBox
                    key={`marker-preview-${target.id}`}
                    target={target}
                    showLabel
                />
            ))}

            {showHoverInspect && hoveredTarget ? (
                <>
                    <HighlightBox
                        key={HOVER_HIGHLIGHT_KEY}
                        target={hoveredTarget}
                    />
                    <PickTargetHoverTooltip target={hoveredTarget} />
                </>
            ) : null}

            {showSelectionHighlight && selectedTarget ? (
                <>
                    <HighlightBox
                        key={SELECTION_HIGHLIGHT_KEY}
                        target={selectedTarget}
                    />
                    {showPickProbeCompare ? <PickTargetCompareChip target={selectedTarget} /> : null}
                </>
            ) : null}

            {activeMarkerTarget ? (
                <HighlightBox
                    key={ACTIVE_MARKER_HIGHLIGHT_KEY}
                    target={activeMarkerTarget}
                    showLabel
                />
            ) : null}
        </>
    );
}
