import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import { toFixedLayerPosition, useFixedPositionOrigin } from "@/shared/hooks/useFixedPositionOrigin.js";
import type { TargetSnapshot } from "@/shared/types/report-ui.js";
import { getPickProbeCompareChipLayout } from "@/shared/utils/probe/pickProbeLayout.js";
import { PickTargetCompareSegment } from "./PickTargetCompareSegment.js";

type PickTargetCompareChipProps = {
    target: TargetSnapshot;
};

export function PickTargetCompareChip({ target }: PickTargetCompareChipProps) {
    const { messages } = useReportPreferences();
    const { pickProbeCompareMode, setPickProbeCompareMode } = useReportSession();
    const { origin, originProbe } = useFixedPositionOrigin();
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

    const position = toFixedLayerPosition(layout?.left ?? target.rect.right, layout?.top ?? target.rect.top, origin);

    return (
        <>
            {originProbe}
            <div
                ref={chipRef}
                className="pointer-events-auto fixed z-[1000003]"
                style={{
                    top: position.top,
                    left: position.left,
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
        </>
    );
}
