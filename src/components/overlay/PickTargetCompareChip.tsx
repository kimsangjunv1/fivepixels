import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { TargetSnapshot } from "@/types/report-ui.js";
import { getPickProbeCompareChipLayout } from "@/utils/probe/pickProbeLayout.js";
import { PickTargetCompareSegment } from "./PickTargetCompareSegment.js";

type PickTargetCompareChipProps = {
    target: TargetSnapshot;
};

export function PickTargetCompareChip({ target }: PickTargetCompareChipProps) {
    const { messages } = useReportPreferences();
    const { pickProbeCompareMode, setPickProbeCompareMode } = useReportSession();
    const chipRef = useRef<HTMLDivElement | null>(null);
    const [layout, setLayout] = useState<{ top: number; left: number } | null>(null);

    const updateLayout = useCallback(() => {
        const chip = chipRef.current;

        if (!chip) {
            return;
        }

        const rect = chip.getBoundingClientRect();
        setLayout(getPickProbeCompareChipLayout(target.rect, rect.width, rect.height));
    }, [target.rect]);

    useLayoutEffect(() => {
        updateLayout();
        const frameId = window.requestAnimationFrame(updateLayout);

        window.addEventListener("resize", updateLayout);
        window.addEventListener("scroll", updateLayout, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("scroll", updateLayout, true);
        };
    }, [target, updateLayout]);

    return (
        <div
            ref={chipRef}
            className="pointer-events-auto fixed z-[1000003]"
            style={{
                top: layout?.top ?? target.rect.top,
                left: layout?.left ?? target.rect.right,
                opacity: layout ? 1 : 0,
            }}
            data-fivepixels-interactive=""
            onClick={(event) => event.stopPropagation()}
        >
            <PickTargetCompareSegment
                mode={pickProbeCompareMode}
                onChange={setPickProbeCompareMode}
                beforeLabel={messages.pickTarget.probeBefore}
                afterLabel={messages.pickTarget.probeAfter}
            />
        </div>
    );
}
