import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useActivitySummary } from "../../hooks/useActivitySummary.js";
import { useReport } from "../../providers/reportContext.js";
import { formatDateOnly } from "../../utils/format.js";
import { buildHeatmapGrid, formatHeatmapMonthLabel, formatShortMonthLabel, getHeatmapCellDelay, getHeatmapEntranceDuration, getYearEntranceDuration, getYearMonthCellDelay, resolveHeatmapLevel, } from "../../utils/heatmapActivity.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/Icons.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
const HEATMAP_CELL_SIZE_PX = 10;
const HEATMAP_YEAR_CELL_SIZE_PX = 18;
const HEATMAP_CELL_GAP_PX = 3;
const HEATMAP_YEAR_CELL_GAP_PX = 4;
const HEATMAP_ANIMATION_STAGGER_MS = 24;
const HEATMAP_ANIMATION_DURATION_MS = 320;
function formatMessage(template, values) {
    return Object.entries(values).reduce((message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)), template);
}
function HeatmapToggleGroup({ label, value, options, onChange, }) {
    return (_jsx("div", { className: "flex flex-wrap gap-[4px]", role: "group", "aria-label": label, children: options.map((option) => (_jsx("button", { type: "button", "aria-pressed": value === option.value, onClick: () => onChange(option.value), className: `rounded-[6px] px-[6px] py-[2px] text-[11px] font-[600] ${value === option.value
                ? "bg-[var(--adaptive-black200)] text-[var(--adaptive-black900)]"
                : "text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)]"}`, children: option.label }, option.value))) }));
}
function heatmapLevelClassName(level) {
    switch (level) {
        case 1:
            return "bg-[var(--adaptive-blue200)]";
        case 2:
            return "bg-[var(--adaptive-blue300)]";
        case 3:
            return "bg-[var(--adaptive-blue400)]";
        case 4:
            return "bg-[var(--adaptive-blue500)]";
        default:
            return "bg-[var(--adaptive-black200)]";
    }
}
export function FeedbackActivityHeatmap() {
    const { reports, currentPageReports, currentPathname, listScope, setListScope, setFilters, panelTab, openPanelTab, sessionActor, canListAllFeedback, onActivitySummary, locale, messages, } = useReport();
    const [viewMode, setViewMode] = useState("daily");
    const [actorScope, setActorScope] = useState("team");
    const [metric, setMetric] = useState("created");
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [drillDownMonth, setDrillDownMonth] = useState(null);
    const [playEntrance, setPlayEntrance] = useState(true);
    const currentYear = new Date().getFullYear();
    const canGoNextYear = selectedYear < currentYear;
    const sourceReports = listScope === "all" ? reports : currentPageReports;
    const summaryParams = useMemo(() => ({
        year: selectedYear,
        pathname: currentPathname,
        listScope,
        actorScope,
        metric,
        actorName: sessionActor?.name ?? null,
    }), [actorScope, currentPathname, listScope, metric, selectedYear, sessionActor?.name]);
    const { summary: yearSummary } = useActivitySummary({
        reports: sourceReports,
        params: summaryParams,
        onActivitySummary,
    });
    const yearBuckets = useMemo(() => {
        const bucketMap = new Map(yearSummary.buckets.map((bucket) => [bucket.dateKey, bucket.count]));
        const buckets = Array.from({ length: 12 }, (_, monthIndex) => {
            const monthKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
            return {
                monthKey,
                monthIndex,
                count: bucketMap.get(monthKey) ?? 0,
            };
        });
        const maxCount = Math.max(0, ...buckets.map((bucket) => bucket.count));
        return { buckets, maxCount, totalCount: yearSummary.totalCount };
    }, [selectedYear, yearSummary.buckets, yearSummary.totalCount]);
    const monthHeatmap = useMemo(() => drillDownMonth
        ? buildHeatmapGrid(sourceReports, {
            monthKey: drillDownMonth,
            actorScope,
            metric,
            viewMode,
            actorName: sessionActor?.name ?? null,
        })
        : null, [actorScope, drillDownMonth, metric, sessionActor?.name, sourceReports, viewMode]);
    useEffect(() => {
        setPlayEntrance(true);
        const maxDelay = drillDownMonth
            ? getHeatmapEntranceDuration(monthHeatmap?.totalWeeks ?? 0, HEATMAP_ANIMATION_STAGGER_MS, HEATMAP_ANIMATION_DURATION_MS)
            : getYearEntranceDuration(HEATMAP_ANIMATION_STAGGER_MS, HEATMAP_ANIMATION_DURATION_MS);
        const timer = window.setTimeout(() => setPlayEntrance(false), maxDelay + 80);
        return () => window.clearTimeout(timer);
    }, [actorScope, drillDownMonth, listScope, metric, monthHeatmap?.totalWeeks, selectedYear, viewMode]);
    const handleDayCellClick = (dateKey) => {
        setFilters((current) => ({ ...current, dateKey }));
        if (panelTab !== "feedback-list") {
            openPanelTab("feedback-list");
        }
    };
    const heatmapMessages = messages.activityHeatmap;
    return (_jsxs("section", { className: "border-b border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[16px] py-[12px]", children: [_jsxs("div", { className: "mb-[10px] flex items-start justify-between gap-[8px]", children: [_jsx("p", { className: "text-[13px] font-[700] text-[var(--adaptive-black900)]", children: heatmapMessages.title }), drillDownMonth ? (_jsx(HeatmapToggleGroup, { label: heatmapMessages.viewModeAriaLabel, value: viewMode, onChange: setViewMode, options: [
                            { value: "daily", label: heatmapMessages.viewDaily },
                            { value: "weekly", label: heatmapMessages.viewWeekly },
                            { value: "cumulative", label: heatmapMessages.viewCumulative },
                        ] })) : null] }), _jsxs("div", { className: "mb-[10px] flex flex-col gap-[8px]", children: [_jsx(HeatmapToggleGroup, { label: heatmapMessages.actorAriaLabel, value: actorScope, onChange: setActorScope, options: [
                            { value: "team", label: heatmapMessages.actorTeam },
                            { value: "me", label: heatmapMessages.actorMe },
                        ] }), _jsxs("div", { className: "flex flex-wrap items-center gap-[8px]", children: [_jsx(HeatmapToggleGroup, { label: heatmapMessages.metricAriaLabel, value: metric, onChange: setMetric, options: [
                                    { value: "created", label: heatmapMessages.metricCreated },
                                    { value: "activity", label: heatmapMessages.metricActivity },
                                ] }), canListAllFeedback ? (_jsx(HeatmapToggleGroup, { label: heatmapMessages.scopeAriaLabel, value: listScope, onChange: setListScope, options: [
                                    { value: "current", label: heatmapMessages.scopeCurrentPage },
                                    { value: "all", label: heatmapMessages.scopeAllPages },
                                ] })) : null, drillDownMonth ? (_jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("button", { type: "button", onClick: () => setDrillDownMonth(null), className: "rounded-[6px] px-[6px] py-[2px] text-[11px] font-[600] text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-black100)]", children: heatmapMessages.backToYear }), _jsx("p", { className: "text-[11px] font-[700] text-[var(--adaptive-black900)]", children: formatHeatmapMonthLabel(drillDownMonth, locale) })] })) : (_jsxs("nav", { className: "flex items-center gap-[2px]", "aria-label": heatmapMessages.yearNavAriaLabel, children: [_jsx("button", { type: "button", "aria-label": heatmapMessages.prevYear, onClick: () => setSelectedYear((current) => current - 1), className: "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black900)]", children: _jsx(ChevronLeftIcon, { className: "h-3.5 w-3.5" }) }), _jsx("p", { className: "min-w-[56px] px-[4px] text-center text-[11px] font-[700] text-[var(--adaptive-black900)]", children: selectedYear }), _jsx("button", { type: "button", "aria-label": heatmapMessages.nextYear, disabled: !canGoNextYear, onClick: () => {
                                            if (canGoNextYear) {
                                                setSelectedYear((current) => current + 1);
                                            }
                                        }, className: "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)] hover:text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-35", children: _jsx(ChevronRightIcon, { className: "h-3.5 w-3.5" }) })] }))] })] }), _jsx("div", { className: "pb-[4px]", children: drillDownMonth && monthHeatmap ? (_jsx("div", { style: {
                        display: "grid",
                        gridTemplateRows: `repeat(7, ${HEATMAP_CELL_SIZE_PX}px)`,
                        gridTemplateColumns: `repeat(${monthHeatmap.totalWeeks}, ${HEATMAP_CELL_SIZE_PX}px)`,
                        gap: `${HEATMAP_CELL_GAP_PX}px`,
                    }, children: monthHeatmap.cells.map((cell, index) => {
                        const level = resolveHeatmapLevel(cell.count, monthHeatmap.maxCount);
                        const delay = playEntrance ? getHeatmapCellDelay(cell.weekIndex, cell.dayOfWeek, monthHeatmap.totalWeeks, HEATMAP_ANIMATION_STAGGER_MS) : 0;
                        const labelDate = cell.dateKey ? formatDateOnly(`${cell.dateKey}T12:00:00`, locale) : "";
                        const tooltipLabel = cell.dateKey
                            ? cell.count > 0
                                ? formatMessage(heatmapMessages.cellTooltip, { date: labelDate, count: cell.count })
                                : formatMessage(heatmapMessages.cellTooltipEmpty, { date: labelDate })
                            : "";
                        const ariaLabel = cell.dateKey
                            ? formatMessage(heatmapMessages.cellAriaLabel, { date: labelDate, count: cell.count })
                            : undefined;
                        const button = (_jsx("button", { type: "button", disabled: !cell.inRange || !cell.dateKey, "aria-label": ariaLabel, onClick: () => {
                                if (cell.dateKey && cell.inRange) {
                                    handleDayCellClick(cell.dateKey);
                                }
                            }, className: `${playEntrance ? "fivepixels-heatmap-dot" : ""} rounded-[2px] ${cell.inRange
                                ? `${heatmapLevelClassName(level)} cursor-pointer hover:ring-1 hover:ring-[var(--adaptive-blue300)]`
                                : "pointer-events-none bg-[var(--adaptive-black200)] opacity-35"}`, style: {
                                gridColumn: cell.weekIndex + 1,
                                gridRow: cell.dayOfWeek + 1,
                                width: HEATMAP_CELL_SIZE_PX,
                                height: HEATMAP_CELL_SIZE_PX,
                                animationDelay: `${delay}ms`,
                            } }, `${cell.weekIndex}-${cell.dayOfWeek}-${index}`));
                        if (!cell.inRange || !cell.dateKey || !tooltipLabel) {
                            return button;
                        }
                        return (_jsx(HoverTooltip, { label: tooltipLabel, className: "contents", children: button }, `${cell.weekIndex}-${cell.dayOfWeek}-${index}`));
                    }) })) : (_jsxs("div", { children: [_jsx("div", { style: {
                                display: "grid",
                                gridTemplateColumns: `repeat(12, ${HEATMAP_YEAR_CELL_SIZE_PX}px)`,
                                gap: `${HEATMAP_YEAR_CELL_GAP_PX}px`,
                            }, children: yearBuckets.buckets.map((bucket) => {
                                const level = resolveHeatmapLevel(bucket.count, yearBuckets.maxCount);
                                const delay = playEntrance ? getYearMonthCellDelay(bucket.monthIndex, HEATMAP_ANIMATION_STAGGER_MS) : 0;
                                const monthLabel = formatShortMonthLabel(bucket.monthIndex, locale);
                                const tooltipLabel = bucket.count > 0
                                    ? formatMessage(heatmapMessages.monthBucketTooltip, { month: monthLabel, count: bucket.count })
                                    : formatMessage(heatmapMessages.monthBucketTooltipEmpty, { month: monthLabel });
                                const ariaLabel = formatMessage(heatmapMessages.monthBucketAriaLabel, { month: monthLabel, count: bucket.count });
                                const button = (_jsx("button", { type: "button", "aria-label": ariaLabel, onClick: () => setDrillDownMonth(bucket.monthKey), className: `${playEntrance ? "fivepixels-heatmap-dot" : ""} rounded-[3px] ${heatmapLevelClassName(level)} cursor-pointer hover:ring-1 hover:ring-[var(--adaptive-blue300)]`, style: {
                                        width: HEATMAP_YEAR_CELL_SIZE_PX,
                                        height: HEATMAP_YEAR_CELL_SIZE_PX,
                                        animationDelay: `${delay}ms`,
                                    } }, bucket.monthKey));
                                return (_jsx(HoverTooltip, { label: tooltipLabel, className: "contents", children: button }, bucket.monthKey));
                            }) }), _jsx("div", { className: "mt-[6px] grid", style: {
                                gridTemplateColumns: `repeat(12, ${HEATMAP_YEAR_CELL_SIZE_PX}px)`,
                                gap: `${HEATMAP_YEAR_CELL_GAP_PX}px`,
                            }, children: yearBuckets.buckets.map((bucket) => (_jsx("span", { className: "text-center text-[10px] text-[var(--adaptive-black500)]", style: { width: HEATMAP_YEAR_CELL_SIZE_PX }, children: formatShortMonthLabel(bucket.monthIndex, locale) }, `${bucket.monthKey}-label`))) })] })) }), _jsxs("div", { className: "mt-[8px] flex items-center justify-between gap-[8px] text-[10px] text-[var(--adaptive-black500)]", children: [_jsxs("div", { className: "flex items-center gap-[4px]", children: [_jsx("span", { children: heatmapMessages.legendLess }), _jsx("span", { className: "h-[10px] w-[10px] rounded-[2px] bg-[var(--adaptive-black200)]" }), _jsx("span", { className: "h-[10px] w-[10px] rounded-[2px] bg-[var(--adaptive-blue200)]" }), _jsx("span", { className: "h-[10px] w-[10px] rounded-[2px] bg-[var(--adaptive-blue300)]" }), _jsx("span", { className: "h-[10px] w-[10px] rounded-[2px] bg-[var(--adaptive-blue400)]" }), _jsx("span", { className: "h-[10px] w-[10px] rounded-[2px] bg-[var(--adaptive-blue500)]" }), _jsx("span", { children: heatmapMessages.legendMore })] }), _jsx("p", { children: formatMessage(heatmapMessages.totalCount, { count: drillDownMonth && monthHeatmap ? monthHeatmap.totalCount : yearBuckets.totalCount }) })] })] }));
}
//# sourceMappingURL=FeedbackActivityHeatmap.js.map