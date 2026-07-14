import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { PointerFollowTooltip } from "../../components/ui/PointerFollowTooltip.js";
import { panelNumericClassName } from "../../utils/panel/panelTypography.js";
import { formatHourLabel, resolveHourlyBarHeightPx, } from "../../utils/panel/hourlyCompareSparkline.js";
const BAR_MAX_HEIGHT_PX = 36;
const BAR_MIN_HEIGHT_PX = 3;
const BAR_IDLE_CLASS = "bg-[var(--adaptive-blue200)]";
const BAR_HOVER_CLASS = "bg-[var(--adaptive-blue500)]";
const BAR_FUTURE_CLASS = "bg-[var(--adaptive-black200)]";
function formatMessage(template, values) {
    return Object.entries(values).reduce((message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)), template);
}
function SummarySide({ label, count, }) {
    return (_jsxs("div", { className: "flex w-[52px] shrink-0 flex-col justify-center gap-[2px]", children: [_jsx("p", { className: "text-[11px] font-[600] leading-none text-[var(--adaptive-black500)]", children: label }), _jsx("p", { className: `text-[18px] font-bold leading-none text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: count.toLocaleString() })] }));
}
function HourColumn({ bucket, maxCount, isHovered, isFuture, ariaLabel, onHover, onLeave, }) {
    const todayHeight = isFuture ? 0 : resolveHourlyBarHeightPx(bucket.todayCount, maxCount, BAR_MAX_HEIGHT_PX, BAR_MIN_HEIGHT_PX);
    const yesterdayHeight = resolveHourlyBarHeightPx(bucket.yesterdayCount, maxCount, BAR_MAX_HEIGHT_PX, BAR_MIN_HEIGHT_PX);
    const barClass = isHovered ? BAR_HOVER_CLASS : isFuture ? BAR_FUTURE_CLASS : BAR_IDLE_CLASS;
    return (_jsxs("button", { type: "button", "aria-label": ariaLabel, className: "group relative flex min-w-0 flex-1 flex-col items-center", onMouseEnter: (event) => onHover(bucket, event.clientX, event.clientY), onMouseMove: (event) => onHover(bucket, event.clientX, event.clientY), onMouseLeave: onLeave, onFocus: (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onHover(bucket, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }, onBlur: onLeave, children: [_jsx("span", { className: "flex w-full items-end justify-center", style: { height: `${BAR_MAX_HEIGHT_PX}px` }, children: _jsx("span", { "aria-hidden": true, className: `w-full max-w-[8px] rounded-t-[2px] ${barClass}`, style: { height: `${todayHeight}px` } }) }), _jsx("span", { "aria-hidden": true, className: "h-[1px] w-full bg-[var(--adaptive-border-subtle)]" }), _jsx("span", { className: "flex w-full items-start justify-center", style: { height: `${BAR_MAX_HEIGHT_PX}px` }, children: _jsx("span", { "aria-hidden": true, className: `w-full max-w-[8px] rounded-b-[2px] ${isHovered ? BAR_HOVER_CLASS : BAR_IDLE_CLASS}`, style: { height: `${yesterdayHeight}px` } }) })] }));
}
export function RouteDetailsTimeline({ sparkline, todayLabel, yesterdayLabel, timelineAriaLabel, hourAriaLabelTemplate, tooltipTodayTemplate, tooltipYesterdayTemplate, }) {
    const [hoveredBucket, setHoveredBucket] = useState(null);
    const [hoverPointer, setHoverPointer] = useState(null);
    const activeBucket = useMemo(() => {
        if (hoveredBucket) {
            return hoveredBucket;
        }
        return sparkline.buckets[sparkline.currentHour] ?? sparkline.buckets[0] ?? null;
    }, [hoveredBucket, sparkline.buckets, sparkline.currentHour]);
    const handleHover = (bucket, clientX, clientY) => {
        setHoveredBucket(bucket);
        setHoverPointer({ clientX, clientY });
    };
    const handleLeave = () => {
        setHoveredBucket(null);
        setHoverPointer(null);
    };
    return (_jsxs("section", { className: "flex flex-col border-b border-b-[var(--adaptive-border-subtle)] px-[16px] py-[12px]", children: [_jsxs("div", { className: "flex items-stretch gap-[10px]", children: [_jsxs("div", { className: "flex shrink-0 flex-col justify-between py-[2px]", children: [_jsx(SummarySide, { label: todayLabel, count: activeBucket?.todayCount ?? 0 }), _jsx(SummarySide, { label: yesterdayLabel, count: activeBucket?.yesterdayCount ?? 0 })] }), _jsx("div", { className: "flex min-w-0 flex-1 items-stretch gap-[1px]", role: "img", "aria-label": timelineAriaLabel, children: sparkline.buckets.map((bucket) => {
                            const isFuture = bucket.hour > sparkline.currentHour;
                            const isHovered = hoveredBucket?.hour === bucket.hour;
                            return (_jsx(HourColumn, { bucket: bucket, maxCount: sparkline.maxCount, isHovered: isHovered, isFuture: isFuture, ariaLabel: formatMessage(hourAriaLabelTemplate, {
                                    hour: formatHourLabel(bucket.hour),
                                    todayCount: bucket.todayCount,
                                    yesterdayCount: bucket.yesterdayCount,
                                }), onHover: handleHover, onLeave: handleLeave }, bucket.hour));
                        }) })] }), _jsx(PointerFollowTooltip, { open: Boolean(hoveredBucket && hoverPointer), pointer: hoverPointer, className: "min-w-[160px]", children: hoveredBucket ? (_jsxs("div", { className: "flex flex-col gap-[4px] text-left text-[12px] leading-[1.4]", children: [_jsxs("p", { className: "flex items-center justify-between gap-[12px]", children: [_jsx("span", { className: "text-[var(--adaptive-black500)]", children: formatMessage(tooltipTodayTemplate, { hour: formatHourLabel(hoveredBucket.hour) }) }), _jsx("span", { className: `font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: hoveredBucket.todayCount.toLocaleString() })] }), _jsxs("p", { className: "flex items-center justify-between gap-[12px]", children: [_jsx("span", { className: "text-[var(--adaptive-black500)]", children: formatMessage(tooltipYesterdayTemplate, { hour: formatHourLabel(hoveredBucket.hour) }) }), _jsx("span", { className: `font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: hoveredBucket.yesterdayCount.toLocaleString() })] })] })) : null })] }));
}
//# sourceMappingURL=RouteDetailsTimeline.js.map