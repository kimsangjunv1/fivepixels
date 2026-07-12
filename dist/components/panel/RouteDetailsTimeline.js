import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef } from "react";
import { toDateKey } from "../../utils/heatmapActivity.js";
const CELL_WIDTH_PX = 22;
const PILL_WIDTH_PX = 6;
const BAR_AREA_HEIGHT_PX = 22;
const HEIGHT_NONE_PX = 6;
const HEIGHT_MID_PX = 12;
const HEIGHT_HIGH_PX = 20;
function formatMessage(template, values) {
    return Object.entries(values).reduce((message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)), template);
}
function resolveTimelineLevel(bucket, maxCount, isFuture) {
    if (isFuture || bucket.count <= 0 || maxCount <= 0) {
        return "none";
    }
    if (maxCount === 1) {
        return "mid";
    }
    const midThreshold = maxCount / 2;
    return bucket.count <= midThreshold ? "mid" : "high";
}
function levelToHeight(level) {
    if (level === "high") {
        return HEIGHT_HIGH_PX;
    }
    if (level === "mid") {
        return HEIGHT_MID_PX;
    }
    return HEIGHT_NONE_PX;
}
function resolvePillColor(isSelected, isFuture) {
    if (isSelected) {
        return "bg-[var(--adaptive-orange500)]";
    }
    if (isFuture) {
        return "bg-[var(--adaptive-black300)]";
    }
    return "bg-[var(--adaptive-black900)]";
}
function scrollDateToCenter(container, dateKey) {
    const target = container.querySelector(`[data-date-key="${dateKey}"]`);
    if (!target) {
        return;
    }
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    container.scrollLeft = Math.max(0, targetCenter - container.clientWidth / 2);
}
export function RouteDetailsTimeline({ sparkline, selectedDateKey, onSelectDateKey, basedOnThisMonthLabel, timelineAriaLabel, dayAriaLabelTemplate, referenceDate = new Date(), }) {
    const scrollRef = useRef(null);
    const todayKey = toDateKey(referenceDate);
    const centeredMonthRef = useRef(null);
    useLayoutEffect(() => {
        const container = scrollRef.current;
        if (!container) {
            return;
        }
        if (centeredMonthRef.current === sparkline.monthKey) {
            return;
        }
        scrollDateToCenter(container, todayKey);
        centeredMonthRef.current = sparkline.monthKey;
    }, [sparkline.monthKey, todayKey]);
    return (_jsxs("section", { className: "flex flex-col gap-[4px] pt-[10px] pb-[2px]", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-y-[2px] left-1/2 z-[2] w-[1px] -translate-x-1/2 bg-[var(--adaptive-orange500)]" }), _jsx("div", { ref: scrollRef, className: "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", role: "listbox", "aria-label": timelineAriaLabel, children: _jsx("div", { className: "flex items-end py-[2px]", style: {
                                paddingLeft: `calc(50% - ${CELL_WIDTH_PX / 2}px)`,
                                paddingRight: `calc(50% - ${CELL_WIDTH_PX / 2}px)`,
                            }, children: sparkline.buckets.map((bucket) => {
                                const isSelected = bucket.dateKey === selectedDateKey;
                                const isFuture = bucket.dateKey > todayKey;
                                const level = resolveTimelineLevel(bucket, sparkline.maxCount, isFuture);
                                const heightPx = levelToHeight(level);
                                const pillColor = resolvePillColor(isSelected, isFuture);
                                return (_jsxs("button", { type: "button", role: "option", "data-date-key": bucket.dateKey, "aria-selected": isSelected, "aria-label": formatMessage(dayAriaLabelTemplate, { day: bucket.day, count: bucket.count }), disabled: isFuture, onClick: () => onSelectDateKey(bucket.dateKey), className: `relative z-[1] flex shrink-0 flex-col items-center gap-[4px] ${isFuture ? "cursor-default" : "cursor-pointer"}`, style: { width: `${CELL_WIDTH_PX}px` }, children: [_jsx("span", { className: "flex w-full items-end justify-center", style: { height: `${BAR_AREA_HEIGHT_PX}px` }, children: _jsx("span", { "aria-hidden": true, className: `rounded-full ${pillColor}`, style: { width: `${PILL_WIDTH_PX}px`, height: `${heightPx}px` } }) }), _jsx("span", { className: `flex h-[16px] min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold leading-none ${isSelected
                                                ? "bg-[var(--adaptive-orange500)] px-[3px] text-white"
                                                : isFuture
                                                    ? "text-[var(--adaptive-black400)]"
                                                    : "text-[var(--adaptive-black700)]"}`, children: bucket.day })] }, bucket.dateKey));
                            }) }) })] }), _jsx("p", { className: "px-[16px] text-right text-[11px] font-[500] text-[var(--adaptive-black500)]", children: basedOnThisMonthLabel })] }));
}
//# sourceMappingURL=RouteDetailsTimeline.js.map