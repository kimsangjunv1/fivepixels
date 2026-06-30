import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import { findElementByProbeKey } from "@/utils/pickProbeSession.js";
import { getPickProbeSavedBadgeLayout } from "@/utils/pickProbeLayout.js";

type SavedProbeBadgeProps = {
    elementKey: string;
    label: string;
};

function SavedProbeBadge({ elementKey, label }: SavedProbeBadgeProps) {
    const badgeRef = useRef<HTMLSpanElement | null>(null);
    const [layout, setLayout] = useState<{ top: number; left: number } | null>(null);

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
    }, [elementKey, label]);

    const element = findElementByProbeKey(elementKey);

    if (!element) {
        return null;
    }

    return (
        <span
            ref={badgeRef}
            className="pointer-events-none fixed z-[1000003] rounded-[4px] bg-[#8b5cf6] px-[5px] py-[1px] text-[12px] font-semibold leading-[1.3] text-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
            style={{
                top: layout?.top ?? element.getBoundingClientRect().top,
                left: layout?.left ?? element.getBoundingClientRect().right,
                opacity: layout ? 1 : 0,
            }}
        >
            {label}
        </span>
    );
}

export function PickTargetSavedBadges() {
    const { savedProbeEdits, messages, mode } = useReport();
    const [, setTick] = useState(0);

    useEffect(() => {
        if (mode !== "report" || Object.keys(savedProbeEdits).length === 0) {
            return;
        }

        const update = () => setTick((value) => value + 1);

        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [mode, savedProbeEdits]);

    if (mode !== "report") {
        return null;
    }

    return (
        <>
            {Object.keys(savedProbeEdits).map((elementKey) => (
                <SavedProbeBadge
                    key={elementKey}
                    elementKey={elementKey}
                    label={messages.pickTarget.probeModifiedBadge}
                />
            ))}
        </>
    );
}
