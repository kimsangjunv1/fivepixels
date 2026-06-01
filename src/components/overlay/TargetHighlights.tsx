import { useState } from "react";
import { TARGET_COLOR, TARGET_SURFACE } from "../../constants/report.js";
import type { TargetSnapshot } from "../../types/report-ui.js";
import { AnimatedPresence, motion } from "../motion/index.js";

type TargetHighlightsProps = {
    hoveredTarget: TargetSnapshot | null;
    previewTargets?: TargetSnapshot[];
    selectedTarget: TargetSnapshot | null;
};

function HighlightBox({ target, showLabel }: { target: TargetSnapshot; showLabel?: boolean }) {
    return (
        <div
            className="pointer-events-none fixed box-border rounded-sm"
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
                <span
                    className="absolute left-0 top-0 -translate-y-full rounded px-1 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: TARGET_COLOR[target.type] }}
                >
                    {target.type} · {target.id}
                </span>
            ) : null}
        </div>
    );
}

export function TargetHighlights({ hoveredTarget, previewTargets = [], selectedTarget }: TargetHighlightsProps) {
    const [test, setTest] = useState(false);
    return (
        <>
            <AnimatedPresence>
                <motion.div
                    layout
                    layoutId="asd"
                    className="w-[32px] h-[32px] bg-black"
                    style={{ width: test ? "20px" : "30px" }}
                    onClick={() => setTest(!test)}
                />
                {previewTargets.map((target) => (
                    <motion.div
                        layout
                        layoutId="asd"
                        key={`${target.type}-${target.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <HighlightBox
                            key={`${target.type}-${target.id}`}
                            target={target}
                            showLabel
                        />
                    </motion.div>
                ))}

                {hoveredTarget ? (
                    <motion.div
                        layout
                        layoutId="asd"
                        // key={`${target.type}-${target.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <HighlightBox
                            target={hoveredTarget}
                            showLabel
                        />
                    </motion.div>
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
