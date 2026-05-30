import { TARGET_COLOR } from "../../constants/report.js";
import type { TargetSnapshot } from "../../types/report-ui.js";
import { reportStyles } from "../report/styles.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    selectedTarget: TargetSnapshot | null;
};

export function TargetHighlights({ hoveredTarget, selectedTarget }: TargetHighlightsProps) {
    return (
        <>
            {hoveredTarget ? (
                <div
                    style={{
                        ...reportStyles.highlightBox,
                        left: hoveredTarget.rect.left,
                        top: hoveredTarget.rect.top,
                        width: hoveredTarget.rect.width,
                        height: hoveredTarget.rect.height,
                        outline: `2px solid ${TARGET_COLOR[hoveredTarget.type]}`,
                        backgroundColor: `${TARGET_COLOR[hoveredTarget.type]}15`,
                    }}
                >
                    <span
                        style={{
                            ...reportStyles.highlightLabel,
                            backgroundColor: TARGET_COLOR[hoveredTarget.type],
                        }}
                    >
                        {hoveredTarget.type} · {hoveredTarget.id}
                    </span>
                </div>
            ) : null}

            {selectedTarget ? (
                <div
                    style={{
                        ...reportStyles.highlightBox,
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
