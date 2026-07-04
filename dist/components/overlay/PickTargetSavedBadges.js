import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReport } from "../../providers/reportContext.js";
import { findElementByProbeKey } from "../../utils/pickProbeSession.js";
import { getPickProbeSavedBadgeLayout } from "../../utils/pickProbeLayout.js";
function SavedProbeBadge({ elementKey, label, badgeOpacity }) {
    const badgeRef = useRef(null);
    const [layout, setLayout] = useState(null);
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
    return (_jsx("span", { ref: badgeRef, className: "pointer-events-none fixed z-[1000003] rounded-[4px] bg-[#8b5cf6] px-[5px] py-[1px] text-[12px] font-semibold leading-[1.3] text-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]", style: {
            top: layout?.top ?? element.getBoundingClientRect().top,
            left: layout?.left ?? element.getBoundingClientRect().right,
            opacity: layout ? badgeOpacity : 0,
        }, children: label }));
}
export function PickTargetSavedBadges() {
    const { savedProbeEdits, messages, mode } = useReport();
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
    return (_jsx(_Fragment, { children: savedElementKeys.map((elementKey) => (_jsx(SavedProbeBadge, { elementKey: elementKey, label: messages.pickTarget.probeModifiedBadge, badgeOpacity: badgeOpacity }, elementKey))) }));
}
//# sourceMappingURL=PickTargetSavedBadges.js.map