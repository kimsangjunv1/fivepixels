import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import type { ReportTargetType } from "../../types/report.js";
import type { TargetSnapshot } from "../../types/report-ui.js";
import { AnimatedPresence, motion, type MotionTransition } from "../motion/index.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    previewTargets?: TargetSnapshot[];
    selectedTarget: TargetSnapshot | null;
};

const HIGHLIGHT_MOTION: Record<
    ReportTargetType,
    {
        fade: MotionTransition;
        layout: MotionTransition;
    }
> = {
    group: {
        fade: { duration: 0.14, ease: "ease-out" },
        layout: { duration: 0.5, ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
    item: {
        fade: { duration: 0.14, ease: "ease-out" },
        layout: { duration: 0.44, ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
};

function highlightPresenceKey(type: ReportTargetType) {
    return `hover-${type}`;
}

function HighlightMotionBox({ target, showLabel }: { target: TargetSnapshot; showLabel?: boolean }) {
    const motionPreset = HIGHLIGHT_MOTION[target.type];

    return (
        <motion.div
            layout
            layoutTransition={motionPreset.layout}
            transition={motionPreset.fade}
            className="pointer-events-none fixed box-border"
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
                    className="absolute left-0 top-0 -translate-y-full px-1 py-0.5 font-[var(--coding-font)] text-[12px] font-medium text-white"
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
                        key={highlightPresenceKey(hoveredTarget.type)}
                        target={hoveredTarget}
                        showLabel
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
