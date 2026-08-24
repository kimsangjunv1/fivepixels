import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { formatSavedProbeEditSummary } from "@/utils/probe/pickProbe.js";
import { findElementByProbeKey } from "@/utils/probe/pickProbeSession.js";
import { getPickProbeSavedBadgeLayout } from "@/utils/probe/pickProbeLayout.js";

const MODIFIED_BADGE_CLASS =
    "cursor-default rounded-[4px] bg-[#8b5cf6] px-[5px] py-[1px] text-[12px] font-semibold leading-[1.3] text-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]";

type SavedProbeBadgeProps = {
    elementKey: string;
    badgeOpacity: number;
};

function SavedProbeBadge({ elementKey, badgeOpacity }: SavedProbeBadgeProps) {
    const { messages } = useReportPreferences();
    const { savedProbeEdits } = useReportSession();
    const badgeRef = useRef<HTMLSpanElement | null>(null);
    const [layout, setLayout] = useState<{ top: number; left: number } | null>(null);
    const modifiedSummary = useMemo(() => {
        const entry = savedProbeEdits[elementKey];

        if (!entry) {
            return "";
        }

        return formatSavedProbeEditSummary(entry, messages);
    }, [elementKey, messages, savedProbeEdits]);

    useLayoutEffect(() => {
        const element = findElementByProbeKey(elementKey);
        const badge = badgeRef.current;

        if (!element || !badge) {
            setLayout(null);
            return;
        }

        const update = () => {
            const rect = element.getBoundingClientRect();
            const badgeRect = badge.getBoundingClientRect();
            setLayout(getPickProbeSavedBadgeLayout(rect, badgeRect.width, badgeRect.height));
        };

        update();
        const frameId = window.requestAnimationFrame(update);

        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [elementKey, modifiedSummary]);

    const element = findElementByProbeKey(elementKey);

    if (!element || !modifiedSummary) {
        return null;
    }

    const fallbackRect = element.getBoundingClientRect();

    return (
        <HoverTooltip
            content={modifiedSummary}
            multiline
        >
            <span
                ref={badgeRef}
                className={`pointer-events-auto fixed z-[1000003] ${MODIFIED_BADGE_CLASS}`}
                style={{
                    top: layout?.top ?? fallbackRect.top,
                    left: layout?.left ?? fallbackRect.right,
                    opacity: layout ? badgeOpacity : 0,
                }}
                data-fivepixels-interactive=""
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                {messages.pickTarget.probeModifiedBadge}
            </span>
        </HoverTooltip>
    );
}

export function PickTargetSavedBadges() {
    const { savedProbeEdits, mode } = useReportSession();
    const [, setTick] = useState(0);
    const savedElementKeys = Object.keys(savedProbeEdits);
    const badgeOpacity = mode === "report" ? 1 : 0.5;

    useEffect(() => {
        if (savedElementKeys.length === 0) {
            return;
        }

        const update = () => setTick((value) => value + 1);

        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [savedElementKeys.length]);

    if (savedElementKeys.length === 0) {
        return null;
    }

    return (
        <>
            {savedElementKeys.map((elementKey) => (
                <SavedProbeBadge
                    key={elementKey}
                    elementKey={elementKey}
                    badgeOpacity={badgeOpacity}
                />
            ))}
        </>
    );
}
