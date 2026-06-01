import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import type { TargetSnapshot } from "../../types/report-ui.js";
import { AnimatedPresence, motion } from "../motion/index.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    previewTargets?: TargetSnapshot[];
    selectedTarget: TargetSnapshot | null;
};

const HIGHLIGHT_LAYOUT_TRANSITION = { duration: 0.22, ease: "ease-in-out" } as const;
const HOVER_LAYOUT_ID = "stitchable-target-highlight-hover";

function HighlightMotionBox({ target, showLabel, layoutId }: { target: TargetSnapshot; showLabel?: boolean; layoutId?: string }) {
    return (
        <motion.div
            layout
            layoutId={layoutId}
            transition={HIGHLIGHT_LAYOUT_TRANSITION}
            className="pointer-events-none fixed box-border rounded-sm"
            style={{
                left: target.rect.left,
                top: target.rect.top,
                width: target.rect.width,
                height: target.rect.height,
                outline: `2px solid ${TARGET_COLOR[target.type]}`,
                backgroundColor: TARGET_SURFACE[target.type],
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {showLabel ? (
                <span
                    className="absolute left-0 top-0 -translate-y-full rounded px-1 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: TARGET_COLOR[target.type] }}
                >
                    {target.type} · {target.id}
                </span>
            ) : null}
        </motion.div>
    );
}

export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }: TargetHighlightsProps) {
    return (
        <>
            <AnimatedPresence>
                {previewTargets.map((target) => (
                    <HighlightMotionBox
                        key={`${target.type}-${target.id}`}
                        target={target}
                        showLabel
                    />
                ))}

                {hoveredTarget ? (
                    <HighlightMotionBox
                        key="hover-highlight"
                        target={hoveredTarget}
                        showLabel
                        layoutId={hoveredTarget.type}
                    />
                ) : null}
            </AnimatedPresence>

            {selectedTarget ? (
                <div
                    className="pointer-events-none fixed box-border rounded-sm"
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
