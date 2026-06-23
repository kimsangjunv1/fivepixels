import { TARGET_COLOR } from "@/constants/report.js";
import type { ReportTargetType } from "@/types/report.js";
import type { TargetSnapshot } from "@/types/report-ui.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    previewTargets?: TargetSnapshot[];
    selectedTarget: TargetSnapshot | null;
};

function highlightPresenceKey(type: ReportTargetType) {
    return `hover-${type}`;
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
                outline: `2px solid #0ed1b4`,
                backgroundColor: "#0ed1b41c",
            }}
        >
            {showLabel ? (
                <span
                    className="absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white"
                    style={{ backgroundColor: TARGET_COLOR[target.type] }}
                >
                    {target.type} · {target.id}
                </span>
            ) : null}
        </div>
    );
}

export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }: TargetHighlightsProps) {
    return (
        <>
            {previewTargets.map((target) => (
                <HighlightBox
                    key={`${target.type}-${target.id}`}
                    target={target}
                    showLabel
                />
            ))}

            {hoveredTarget ? (
                <HighlightBox
                    key={highlightPresenceKey(hoveredTarget.type)}
                    target={hoveredTarget}
                    showLabel
                />
            ) : null}

            {selectedTarget ? (
                <div
                    className="pointer-events-none fixed box-border rounded-sm"
                    style={{
                        left: selectedTarget.rect.left,
                        top: selectedTarget.rect.top,
                        width: selectedTarget.rect.width,
                        height: selectedTarget.rect.height,
                    }}
                />
            ) : null}
        </>
    );
}
