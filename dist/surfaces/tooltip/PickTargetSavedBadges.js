import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { HoverTooltip } from "../../surfaces/tooltip/HoverTooltip.js";
import { useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { toFixedLayerPosition, useFixedPositionOrigin } from "../../shared/hooks/useFixedPositionOrigin.js";
import { formatSavedProbeEditSummary } from "../../shared/utils/probe/pickProbe.js";
import { findElementByProbeKey } from "../../shared/utils/probe/pickProbeSession.js";
import { getPickProbeSavedBadgeLayout } from "../../shared/utils/probe/pickProbeLayout.js";
const MODIFIED_BADGE_CLASS = "cursor-default rounded-[4px] bg-[#8b5cf6] px-[5px] py-[1px] text-[12px] font-semibold leading-[1.5] text-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]";
function SavedProbeBadge({ elementKey, badgeOpacity }) {
    const { messages } = useReportPreferences();
    const { savedProbeEdits } = useReportSession();
    const { origin, originProbe } = useFixedPositionOrigin();
    const badgeRef = useRef(null);
    const [layout, setLayout] = useState(null);
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
    const position = toFixedLayerPosition(layout?.left ?? fallbackRect.right, layout?.top ?? fallbackRect.top, origin);
    return (_jsxs(_Fragment, { children: [originProbe, _jsx(HoverTooltip, { content: modifiedSummary, multiline: true, children: _jsx("span", { ref: badgeRef, className: `pointer-events-auto fixed z-[1000003] ${MODIFIED_BADGE_CLASS}`, style: {
                        top: position.top,
                        left: position.left,
                        opacity: layout ? badgeOpacity : 0,
                    }, "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: (event) => event.stopPropagation(), children: messages.pickTarget.probeModifiedBadge }) })] }));
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
    return (_jsx(_Fragment, { children: savedElementKeys.map((elementKey) => (_jsx(SavedProbeBadge, { elementKey: elementKey, badgeOpacity: badgeOpacity }, elementKey))) }));
}
//# sourceMappingURL=PickTargetSavedBadges.js.map