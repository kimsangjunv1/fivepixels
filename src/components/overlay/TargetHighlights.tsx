import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import type { TargetSnapshot } from "../../types/report-ui.js";
import { highlight, highlightLabel } from "../report/classes.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    previewTargets?: TargetSnapshot[];
    selectedTarget: TargetSnapshot | null;
};

function HighlightBox({ target, showLabel }: { target: TargetSnapshot; showLabel?: boolean }) {
    return (
        <div
            className={highlight}
            style={{
                left: target.rect.left,
                top: target.rect.top,
                width: target.rect.width,
                height: target.rect.height,
                outline: `2px solid ${TARGET_COLOR[target.type]}`,
                backgroundColor: TARGET_SURFACE[target.type],
            }}
        >
            {showLabel ? (
                <span className={highlightLabel} style={{ backgroundColor: TARGET_COLOR[target.type] }}>
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
                <HighlightBox key={`${target.type}-${target.id}`} target={target} showLabel />
            ))}

            {hoveredTarget ? <HighlightBox target={hoveredTarget} showLabel /> : null}

            {selectedTarget ? (
                <div
                    className={highlight}
                    style={{
                        left: selectedTarget.rect.left,
                        top: selectedTarget.rect.top,
                        width: selectedTarget.rect.width,
                        height: selectedTarget.rect.height,
                        boxShadow: `0 0 0 3px ${TARGET_COLOR[selectedTarget.type]}`,
                    }}
                />
            ) : null}
        </>
    );
}
